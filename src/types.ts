type Property = { [key: string]: any} & { type: string  }
type SchemaType = { [key: string]: any } & { properties: { [key: string]: any} } & { required: string[]} & { type: string}  


export { type SchemaType, type Property  }
