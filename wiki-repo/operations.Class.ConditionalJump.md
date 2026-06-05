[**ts-chef API Documentation**](Home.md)

***

# Class: ConditionalJump

Defined in: [operations/ConditionalJump.ts:16](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L16)

Abstract base class for all operations in ts-chef.

Each operation defines its metadata (name, description, arguments) 
and implements the `run` method to perform data transformation.

## Extends

- [`Operation`](Operation.Class.Operation.md)

## Constructors

### Constructor

> **new ConditionalJump**(): `ConditionalJump`

#### Returns

`ConditionalJump`

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`constructor`](Operation.Class.Operation.md#constructor)

## Properties

### args

> **args**: [`ArgConfig`](Operation.Interface.ArgConfig.md)[]

Defined in: [operations/ConditionalJump.ts:24](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L24)

List of arguments the operation accepts, defined via [[ArgConfig]].

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`args`](Operation.Class.Operation.md#args)

***

### checks?

> `optional` **checks?**: `object`[]

Defined in: [Operation.ts:126](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L126)

Patterns and flags for automatic detection of when this operation might be applicable.

#### args

> **args**: `unknown`[]

#### flags

> **flags**: `string`

#### pattern

> **pattern**: `string`

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`checks`](Operation.Class.Operation.md#checks)

***

### description

> **description**: `string` = `"Conditionally jump forwards or backwards to the specified Label based on whether the data matches the specified regular expression."`

Defined in: [operations/ConditionalJump.ts:19](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L19)

Human-readable description of what the operation does.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`description`](Operation.Class.Operation.md#description)

***

### flowControl

> **flowControl**: `boolean` = `true`

Defined in: [operations/ConditionalJump.ts:23](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L23)

Whether the operation supports flow control (e.g., 'Fork', 'Jump').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`flowControl`](Operation.Class.Operation.md#flowcontrol)

***

### infoURL

> **infoURL**: `string` = `null`

Defined in: [Operation.ts:91](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L91)

Optional URL for more information about the operation or algorithm (e.g., Wikipedia).

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`infoURL`](Operation.Class.Operation.md#infourl)

***

### inputType

> **inputType**: `string` = `"string"`

Defined in: [operations/ConditionalJump.ts:21](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L21)

Expected input data type (e.g., 'string', 'byteArray', 'ArrayBuffer').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`inputType`](Operation.Class.Operation.md#inputtype)

***

### manualBake

> **manualBake**: `boolean` = `false`

Defined in: [Operation.ts:116](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L116)

Whether the operation requires manual triggering rather than automatic baking.

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`manualBake`](Operation.Class.Operation.md#manualbake)

***

### module

> **module**: `string` = `"Default"`

Defined in: [operations/ConditionalJump.ts:18](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L18)

Category or module the operation belongs to (e.g., 'Encryption', 'Hashing').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`module`](Operation.Class.Operation.md#module)

***

### name

> **name**: `string` = `"Conditional Jump"`

Defined in: [operations/ConditionalJump.ts:17](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L17)

Internal name of the operation. 
Used for identification and display.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`name`](Operation.Class.Operation.md#name)

***

### outputType

> **outputType**: `string` = `"string"`

Defined in: [operations/ConditionalJump.ts:22](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L22)

Expected output data type (e.g., 'string', 'byteArray', 'ArrayBuffer').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`outputType`](Operation.Class.Operation.md#outputtype)

***

### presentType

> **presentType**: `string` = `"string"`

Defined in: [Operation.ts:106](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L106)

Type for presentation purposes. Defaults to `outputType`.

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`presentType`](Operation.Class.Operation.md#presenttype)

## Methods

### highlight()

> **highlight**(`_pos`, `_args`): [`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

Defined in: [Operation.ts:164](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L164)

Calculates how selection in the input translates to selection in the output.

Used for synchronized highlighting between input and output panes.

#### Parameters

##### \_pos

[`HighlightPos`](Operation.TypeAlias.HighlightPos.md)

The current highlight positions in the input.

##### \_args

`any`[]

The arguments used.

#### Returns

[`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

The corresponding highlight positions in the output, or `false`.

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`highlight`](Operation.Class.Operation.md#highlight)

***

### highlightReverse()

> **highlightReverse**(`_pos`, `_args`): [`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

Defined in: [Operation.ts:176](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L176)

Calculates how selection in the output translates back to selection in the input.

#### Parameters

##### \_pos

[`HighlightPos`](Operation.TypeAlias.HighlightPos.md)

The current highlight positions in the output.

##### \_args

`any`[]

The arguments used.

#### Returns

[`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

The corresponding highlight positions in the input, or `false`.

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`highlightReverse`](Operation.Class.Operation.md#highlightreverse)

***

### present()

> **present**(`data`, `_args`): `any`

Defined in: [Operation.ts:150](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L150)

Formats the output data for presentation in the UI.

By default, it returns the data as-is. Override this to provide
custom formatting (e.g., HTML rendering, image display).

#### Parameters

##### data

`any`

The output data from the [[run]] method.

##### \_args

`any`[]

The arguments used during execution.

#### Returns

`any`

The formatted presentation data.

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`present`](Operation.Class.Operation.md#present)

***

### run()

> **run**(`input`, `_args`): `string`

Defined in: [operations/ConditionalJump.ts:47](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ConditionalJump.ts#L47)

Executes the operation logic.

#### Parameters

##### input

`string`

The data to process. Can be string, byteArray, etc.

##### \_args

`any`[]

#### Returns

`string`

The processed data.

#### Throws

If processing fails.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`run`](Operation.Class.Operation.md#run)
