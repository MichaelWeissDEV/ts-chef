[**ts-chef API Documentation**](Home.md)

***

# Class: ChaCha

Defined in: [operations/ChaCha.ts:79](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L79)

Abstract base class for all operations in ts-chef.

Each operation defines its metadata (name, description, arguments) 
and implements the `run` method to perform data transformation.

## Extends

- [`Operation`](Operation.Class.Operation.md)

## Constructors

### Constructor

> **new ChaCha**(): `ChaCha`

#### Returns

`ChaCha`

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`constructor`](Operation.Class.Operation.md#constructor)

## Properties

### args

> **args**: [`ArgConfig`](Operation.Interface.ArgConfig.md)[]

Defined in: [operations/ChaCha.ts:87](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L87)

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

> **description**: `string` = `"ChaCha is a stream cipher designed by Daniel J. Bernstein. It is a variant of the Salsa stream cipher. Several parameterizations exist; 'ChaCha' may refer to the original construction, or to the variant as described in RFC-8439. ChaCha is often used with Poly1305, in the ChaCha20-Poly1305 AEAD construction.<br><br><b>Key:</b> ChaCha uses a key of 16 or 32 bytes (128 or 256 bits).<br><br><b>Nonce:</b> ChaCha uses a nonce of 8 or 12 bytes (64 or 96 bits).<br><br><b>Counter:</b> ChaCha uses a counter of 4 or 8 bytes (32 or 64 bits); together, the nonce and counter must add up to 16 bytes. The counter starts at zero at the start of the keystream, and is incremented at every 64 bytes."`

Defined in: [operations/ChaCha.ts:82](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L82)

Human-readable description of what the operation does.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`description`](Operation.Class.Operation.md#description)

***

### flowControl

> **flowControl**: `boolean` = `false`

Defined in: [Operation.ts:111](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L111)

Whether the operation supports flow control (e.g., 'Fork', 'Jump').

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`flowControl`](Operation.Class.Operation.md#flowcontrol)

***

### infoURL

> **infoURL**: `string` = `"https://wikipedia.org/wiki/Salsa20#ChaCha_variant"`

Defined in: [operations/ChaCha.ts:84](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L84)

Optional URL for more information about the operation or algorithm (e.g., Wikipedia).

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`infoURL`](Operation.Class.Operation.md#infourl)

***

### inputType

> **inputType**: `string` = `"string"`

Defined in: [operations/ChaCha.ts:85](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L85)

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

> **module**: `string` = `"Ciphers"`

Defined in: [operations/ChaCha.ts:81](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L81)

Category or module the operation belongs to (e.g., 'Encryption', 'Hashing').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`module`](Operation.Class.Operation.md#module)

***

### name

> **name**: `string` = `"ChaCha"`

Defined in: [operations/ChaCha.ts:80](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L80)

Internal name of the operation. 
Used for identification and display.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`name`](Operation.Class.Operation.md#name)

***

### outputType

> **outputType**: `string` = `"string"`

Defined in: [operations/ChaCha.ts:86](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L86)

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

> **run**(`input`, `args`): `string`

Defined in: [operations/ChaCha.ts:123](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/ChaCha.ts#L123)

Executes the operation logic.

#### Parameters

##### input

`string`

The data to process. Can be string, byteArray, etc.

##### args

`any`[]

The arguments configured for this instance of the operation.

#### Returns

`string`

The processed data.

#### Throws

If processing fails.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`run`](Operation.Class.Operation.md#run)
