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
async render()

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

### Experience Pips
Accessed through `mythacri.experience`.
```js
/**
 * Award all player-owned character-type actors with 1 pip.
 * @param {boolean} [assigned=false]      Whether to restrict to assigned actors.
 * @returns {Promise<Actor5e[]>}          The updated actors.
 */
async grantPip(assigned = false)
```

### Resting
Accessed through any `character` type actor, the new async method `Actor5e#fullRest` prompts for taking a full rest, restoring all of an actor's resources.
```js
/**
 * Render a prompt to recover all expended resources. Added to actor prototype.
 * @returns {Promise<object>}     A promise that resolves to the result of the full rest.
 */
async fullRestDialog()
```
