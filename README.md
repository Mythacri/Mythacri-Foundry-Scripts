# Mythacri-Foundry-Scripts
Foundry Scripts

## API

### Mayhem
Accessed through `mythacri.mayhem`.
```js
/**
 * Render an instance of the mayhem ui for manually changing the points.
 * @returns {MayhemUI}      A rendered MayhemUI application.
 */
async create()

/**
 * Add mayhem points to yourself.
 * @param {number} [value=1]          The amount of points to add.
 * @returns {Promise<User|null>}      The updated User, or null if the value was invalid.
 */
async add(value = 1)

/**
 * Deduct mayhem points from yourself.
 * @param {number} [value=1]          The amount of points to deduct.
 * @returns {Promise<User|null>}      The updated User, or null if the value was invalid.
 */
async deduct(value = 1)
```

### Crafting
Accessed through `mythacri.crafting`.
```js
/**
 * Return whether an item can have runes on it.
 * @param {Item5e} item
 * @returns {boolean}
 */
itemCanHaveRunes(item)

/**
 * Get the resource identifier from a loot-type item, e.g., 'monster.celestial.eye' or 'gem.ruby'.
 * @param {Item} item         The item with the identifier.
 * @returns {string|null}     The proper identifier, or null if invalid or not applicable.
 */
getIdentifier(item)

/**
 * Is this resource identifier valid?
 * @param {string} id                         A string id, usually of the form `monster.celestial.eye`.
 * @param {boolean} [allowWildCard=true]      Is the wildcard token `*` allowed?
 * @returns {boolean}
 */
validIdentifier(id, {allowWildCard = true} = {})

/**
 * Get a human-readable label from a resource identifier.
 * @param {string} id
 * @returns {string}
 */
getLabel(id)
```

### Encounter
Accessed through `mythacri.encounter`.
```js
/**
  * Factory method to render this application and apply a hook.
  * @returns {Encounter}      The rendered Encounter application.
  */
create()
```

### Awarding pips and currencies
Accessed through `mythacri.award`.
```js
/**
 * Award all player-owned character-type actors with pips.
 * @param {object} [options]                Options to modify the awarding.
 * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
 * @param {number} [options.amount]         The amount of pips to grant.
 * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
 * @returns {Promise<void>}
 */
async grantPip({assigned = false, amount = null, each = true} = {})
```

```js
/**
 * Award all player-owned character-type actors with marbles.
 * @param {object} [options]                Options to modify the awarding.
 * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
 * @param {number} [options.amount]         The amount to grant.
 * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
 * @returns {Promise<void>}
 */
async grantMarbles({assigned = false, amount = null, each = false} = {})
```

### Resources
Accessed through `mythacri.resource`.
```js
/**
 * Prompt for populating an actor with lootable resources.
 * @param {Actor5e} actor     The actor to populate.
 */
async populate(actor)
```
