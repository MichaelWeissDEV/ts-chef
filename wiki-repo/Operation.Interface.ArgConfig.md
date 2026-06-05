[**ts-chef API Documentation**](Home.md)

***

# Interface: ArgConfig

Defined in: [Operation.ts:14](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L14)

Configuration for an operation argument.

Defines how an argument should be rendered and validated in the UI.

## Properties

### defaultIndex?

> `optional` **defaultIndex?**: `number`

Defined in: [Operation.ts:35](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L35)

Default index for selection-based arguments (type 'option').

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [Operation.ts:28](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L28)

Whether the argument is disabled by default.

***

### hint?

> `optional` **hint?**: `string`

Defined in: [Operation.ts:24](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L24)

A hint or tooltip describing the purpose of the argument.

***

### max?

> `optional` **max?**: `number`

Defined in: [Operation.ts:41](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L41)

Maximum value for numeric arguments.

***

### maxLength?

> `optional` **maxLength?**: `number`

Defined in: [Operation.ts:37](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L37)

Maximum length for string-based arguments.

***

### min?

> `optional` **min?**: `number`

Defined in: [Operation.ts:39](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L39)

Minimum value for numeric arguments.

***

### name

> **name**: `string`

Defined in: [Operation.ts:16](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L16)

The display name of the argument.

***

### rows?

> `optional` **rows?**: `number`

Defined in: [Operation.ts:26](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L26)

Number of rows for textarea-like arguments (type 'string').

***

### step?

> `optional` **step?**: `number`

Defined in: [Operation.ts:43](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L43)

Step value for numeric arguments.

***

### target?

> `optional` **target?**: `number` \| `number`[]

Defined in: [Operation.ts:33](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L33)

Target indices for dynamic arguments. 
Used when one argument's value affects others.

***

### toggleValues?

> `optional` **toggleValues?**: `string`[]

Defined in: [Operation.ts:22](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L22)

Optional values for 'option' or 'editableOption' type arguments.

***

### type

> **type**: `string`

Defined in: [Operation.ts:18](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L18)

The type of the argument (e.g., 'string', 'number', 'option', 'boolean').

***

### value

> **value**: `unknown`

Defined in: [Operation.ts:20](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L20)

The default or current value of the argument.
