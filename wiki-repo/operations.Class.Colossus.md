[**ts-chef API Documentation**](Home.md)

***

# Class: Colossus

Defined in: [operations/Colossus.ts:19](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L19)

Abstract base class for all operations in ts-chef.

Each operation defines its metadata (name, description, arguments) 
and implements the `run` method to perform data transformation.

## Extends

- [`Operation`](Operation.Class.Operation.md)

## Constructors

### Constructor

> **new Colossus**(): `Colossus`

#### Returns

`Colossus`

#### Inherited from

[`Operation`](Operation.Class.Operation.md).[`constructor`](Operation.Class.Operation.md#constructor)

## Properties

### args

> **args**: [`ArgConfig`](Operation.Interface.ArgConfig.md)[]

Defined in: [operations/Colossus.ts:28](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L28)

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

> **description**: `string` = `"Colossus is the name of the world's first electronic computer. Ten Colossi were designed by Tommy Flowers and built at the Post Office Research Labs at Dollis Hill in 1943 during World War 2. They assisted with the breaking of the German Lorenz cipher attachment, a machine created to encipher communications between Hitler and his generals on the front lines.<br><br>To learn more, Virtual Colossus, an online, browser based simulation of a Colossus computer is available at <a href='https://virtualcolossus.co.uk' target='_blank'>virtualcolossus.co.uk</a>.<br><br>A more detailed description of this operation can be found <a href='https://github.com/gchq/CyberChef/wiki/Colossus' target='_blank'>here</a>."`

Defined in: [operations/Colossus.ts:22](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L22)

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

> **infoURL**: `string` = `"https://wikipedia.org/wiki/Colossus_computer"`

Defined in: [operations/Colossus.ts:24](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L24)

Optional URL for more information about the operation or algorithm (e.g., Wikipedia).

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`infoURL`](Operation.Class.Operation.md#infourl)

***

### inputType

> **inputType**: `string` = `"string"`

Defined in: [operations/Colossus.ts:25](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L25)

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

> **module**: `string` = `"Bletchley"`

Defined in: [operations/Colossus.ts:21](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L21)

Category or module the operation belongs to (e.g., 'Encryption', 'Hashing').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`module`](Operation.Class.Operation.md#module)

***

### name

> **name**: `string` = `"Colossus"`

Defined in: [operations/Colossus.ts:20](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L20)

Internal name of the operation. 
Used for identification and display.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`name`](Operation.Class.Operation.md#name)

***

### outputType

> **outputType**: `string` = `"JSON"`

Defined in: [operations/Colossus.ts:26](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L26)

Expected output data type (e.g., 'string', 'byteArray', 'ArrayBuffer').

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`outputType`](Operation.Class.Operation.md#outputtype)

***

### presentType

> **presentType**: `string` = `"html"`

Defined in: [operations/Colossus.ts:27](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L27)

Type for presentation purposes. Defaults to `outputType`.

#### Overrides

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

> **present**(`output`): `string`

Defined in: [operations/Colossus.ts:593](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L593)

Formats the output data for presentation in the UI.

By default, it returns the data as-is. Override this to provide
custom formatting (e.g., HTML rendering, image display).

#### Parameters

##### output

`any`

#### Returns

`string`

The formatted presentation data.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`present`](Operation.Class.Operation.md#present)

***

### run()

> **run**(`input`, `args`): `any`

Defined in: [operations/Colossus.ts:372](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L372)

Executes the operation logic.

#### Parameters

##### input

`string`

The data to process. Can be string, byteArray, etc.

##### args

`any`[]

The arguments configured for this instance of the operation.

#### Returns

`any`

The processed data.

#### Throws

If processing fails.

#### Overrides

[`Operation`](Operation.Class.Operation.md).[`run`](Operation.Class.Operation.md#run)

***

### selectProgram()

> **selectProgram**(`progname`, `args`): `any`[]

Defined in: [operations/Colossus.ts:516](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/operations/Colossus.ts#L516)

#### Parameters

##### progname

`string`

##### args

`any`[]

#### Returns

`any`[]
