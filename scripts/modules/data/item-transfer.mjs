import {MODULE} from "../constants.mjs";

export class ItemTransfer {
  static init() {
    Hooks.on("dnd5e.getItemContextOptions", ItemTransfer._onGetItemContextOptions);
    Hooks.on("renderChatMessage", ItemTransfer._onRenderChatMessage);
    game.socket.on("mythacri.transferComplete", ItemTransfer._onMarkTransferComplete);
  }

  static _onGetItemContextOptions(item, items) {
    items.push({
      name: "MYTHACRI.ItemTransfer.ContextMenuOption",
      icon: "<i class='fa-arrow-right-arrow-left fa-solid fa-rotate-90'></i>",
      condition: () => "quantity" in item.system,
      callback: () => ItemTransfer.promptTransfer(item),
      group: "action"
    });
  }

  static async promptTransfer(item) {
    if (!("quantity" in item.system)) {
      ui.notifications.error("MYTHACRI.ItemTransfer.InvalidItem", {localize: true});
      return;
    }

    const party = game.settings.get(MODULE.ID, "identifiers").party;

    if (party?.type !== "group") {
      ui.notifications.error("MYTHACRI.ItemTransfer.MissingParty", {localize: true});
      return;
    }

    const choices = party.system.members.reduce((acc, {actor}) => {
      if (actor !== item.actor) acc[actor.uuid] = actor.name;
      return acc;
    }, {});

    const options = {hash: {selected: null, sort: true, localize: false}};

    const selectOptions = HandlebarsHelpers.selectOptions(choices, options);

    const content = `
    <form>
      <div class="form-group">
        <div class="form-fields">
          <select name="actorUuid">${selectOptions}</select>
        </div>
      </div>
    </form>`;

    const uuid = await Dialog.prompt({
      content: content,
      rejectClose: false,
      title: game.i18n.format("MYTHACRI.ItemTransfer.PromptTitle", {name: item.name}),
      label: game.i18n.localize("MYTHACRI.ItemTransfer.PromptLabel"),
      callback: ([html]) => new FormDataExtended(html.querySelector("FORM")).object.actorUuid
    });
    if (!uuid) return;
    return ItemTransfer.transfer(item, {target: uuid});
  }

  static async transfer(item, {target}) {
    const actor = await fromUuid(target);
    const whisperTargets = game.users.reduce((acc, user) => {
      const owner = actor.testUserPermission(user, "OWNER") || item.actor.testUserPermission(user, "OWNER");
      if (owner) acc.push(user.id);
      return acc;
    }, []);
    const messageData = {
      speaker: ChatMessage.implementation.getSpeaker({actor: item.actor}),
      whisper: whisperTargets,
      content: await renderTemplate("modules/mythacri-scripts/templates/item-transfer.hbs", {item: item, source: item.actor, target: actor}),
      "flags.mythacri-scripts.transfer": {
        itemData: JSON.stringify(item.toObject()),
        completed: false,
        target: target,
        source: item.actor.uuid
      }
    };
    const message = await ChatMessage.implementation.create(messageData);
    await item.delete();
    return message;
  }

  static async _onRenderChatMessage(message, [html]) {
    const transfer = message.flags[MODULE.ID]?.transfer;
    if (!transfer || transfer.completed) return;

    const target = await fromUuid(transfer.target);
    const source = await fromUuid(transfer.source);

    html.querySelectorAll("[data-action]").forEach(n => {
      switch (n.dataset.action) {
        case "transfer": {
          if (!target || !target.isOwner) n.disabled = true;
          else n.addEventListener("click", (event) => ItemTransfer._onClickTransfer(event, message, target, transfer));
          break;
        }
        case "cancel": {
          if (!source || !source.isOwner) n.disabled = true;
          else n.addEventListener("click", (event) => ItemTransfer._onClickCancel(event, message, source, transfer));
          break;
        }
      }
    });
  }

  static async _onClickTransfer(event, message, target, transferData) {
    event.currentTarget.disabled = true;
    if (!target.isOwner) return;
    const itemData = JSON.parse(transferData.itemData);
    await target.createEmbeddedDocuments("Item", [itemData]);

    if (!message.isOwner) {
      let userId;
      const gm = game.users.find(u => u.active && u.isGM);
      if (gm) userId = gm.id;
      else {
        const pl = game.users.find(u => {
          return u.active && !u.isGM && message.testUserPermission(u, "OWNER");
        });
        if (pl) userId = pl.id;
      }
      game.socket.emit("mythacri.transferComplete", {messageId: message.id, userId: userId}, true);
    } else {
      ItemTransfer._onMarkTransferComplete({userId: game.user.id, messageId: message.id});
    }
  }

  static async _onClickCancel(event, message, source, transferData) {
    event.currentTarget.disabled = true;
    if (!source.isOwner) return;
    const itemData = JSON.parse(transferData.itemData);
    const keepId = !source.items.has(itemData._id);
    const [item] = await source.createEmbeddedDocuments("Item", [itemData], {keepId: keepId});
    if (!item) return;
    message.delete();
  }

  static async _onMarkTransferComplete({userId, messageId}) {
    if (game.user.id !== userId) return;
    const message = game.messages.get(messageId);

    const div = document.createElement("DIV");
    div.innerHTML = message.content;
    const note = document.createElement("P");
    note.classList.add("notification", "info");
    note.textContent = game.i18n.localize("MYTHACRI.ItemTransfer.Completed");
    div.querySelector(".buttons").replaceWith(note);
    const update = {
      content: div.innerHTML,
      "flags.mythacri-scripts.transfer.completed": true
    };
    message.update(update);
  }
}
