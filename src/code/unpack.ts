import { Field } from "./field";

/** Options for `code.unpack()` */
export enum Endianess {
    Little = 0,
    Big = 1
};

/** Helps with making unpacking protocols.
 * It unpacks variables via left & right shifting 
 * based on a given endianness argument
 */
export class Unpack extends Field {
    public readonly bigEndian:boolean;
    /**
     * @param field Name of the property that should be unpacked to
     * @param endianness determines how to unpack the value provided
     * Default Value: `Endianess.Little`.
     */
    
    constructor (field: string, endianness?:Endianess){
        if (endianness === undefined){
            endianness = Endianess.Little;
        } 
        super(
            'match', 
            endianness == Endianess.Little ? 'unpack_le' : 'unpack_be',  
            field
        );
        this.bigEndian = endianness == Endianess.Big;
    }
}
