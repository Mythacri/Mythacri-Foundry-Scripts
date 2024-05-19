import {MODULE} from "../constants.mjs";

export class ItemTransfer {
  /** Initialize module. */
  static init() {
    Hooks.on("dnd5e.getItemContextOptions", ItemTransfer._onGetItemContextOptions);
    Hooks.on("renderChatMessage", ItemTransfer._onRenderChatMessage);
    game.socket.on("mythacri.transferComplete", ItemTransfer._onMarkTransferComplete);
  }

  /**
   * Hook event that adds an additional context menu option on the actor sheet.
   * @param {Item5e} item         The item to whom the context menu belongs.
   * @param {object[]} items      The context menu entries.
   */
  static _onGetItemContextOptions(item, items) {
    items.push({
      name: "MYTHACRI.ItemTransfer.ContextMenuOption",
      icon: "<i class='fa-arrow-right-arrow-left fa-solid fa-rotate-90'></i>",
      condition: () => "quantity" in item.system,
      callback: () => ItemTransfer.promptTransfer(item),
      group: "action"
    });
  }

  /**
   * Create a prompt to transfer an item via the chat log.
   * @param {Item5e} item                   The item to be transferred.
   * @returns {Promise<ChatMessage5e>}      A promise that resolves to the created chat message.
   */
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

  /**
   * Create a chat message for the receiver to use to receive the transferred item.
   * @param {Item5e} item                   The item that will be deleted from its owner and placed in the chat message.
   * @param {object} options                Context options for the transferral.
   * @param {string} options.target         The uuid of the actor that will receive the item.
   * @returns {Promise<ChatMessage5e>}      A promise that resolves to the created chat message.
   */
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

  /**
   * Hook event that adds event listeners when the chat message for transferring items is created.
   * @param {ChatMessage5e} message     The rendered chat message.
   * @param {HTMLElement} html          The rendered html element.
   */
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

  /**
   * Handle click events on the 'Transfer' button.
   * @param {Event} event               The initiating click event.
   * @param {ChatMessage5e} message     The message the button belongs to.
   * @param {Actor5e} target            The actor to receive the item.
   * @param {object} transferData       The contextual transfer data within the message flags.
   */
  static async _onClickTransfer(event, message, target, transferData) {
    event.currentTarget.disabled = true;
    if (!target.isOwner) return;
    const itemData = JSON.parse(transferData.itemData);

    // Sensibly reset some item data.
    delete itemData.folder;
    delete itemData.ownership;
    delete itemData.sort;
    delete itemData.system.equipped;
    delete itemData.system.crewed;
    // TODO: reset attunement state.

    // Create the item.
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

  /**
   * Handle click events on the 'Cancel' button.
   * @param {Event} event               The initiating click event.
   * @param {ChatMessage5e} message     The message the button belongs to.
   * @param {Actor5e} source            The actor to receive the item.
   * @param {object} transferData       The contextual transfer data within the message flags.
   */
  static async _onClickCancel(event, message, source, transferData) {
    event.currentTarget.disabled = true;
    if (!source.isOwner) return;
    const itemData = JSON.parse(transferData.itemData);
    const keepId = !source.items.has(itemData._id);
    const [item] = await source.createEmbeddedDocuments("Item", [itemData], {keepId: keepId});
    if (!item) return;
    message.delete();
  }

  /**
   * Change the contents of the chat message to mark a transfer of an item as complete.
   * @param {object} data               Data emitted via socket or called manually.
   * @param {string} data.userId        The id of the user asked to update the message.
   * @param {string} data.messageId     The id of the message to be updated.
   */
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
