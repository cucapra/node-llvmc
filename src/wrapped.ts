/**
 * This module contains a set of classes that add abstraction over the
 * low-level functions in the LLVM C API.
 */

import { LLVM } from './llvmc';

/**
 * A base class for our wrapper classes that abstract an `LLVM*Ref` type.
 */
export class Ref {
  /**
   * Create a new wrapepr for an underlying `LLVM*Ref` value.
   */
  constructor(public ref: any) {}
}

/**
 * An LLVM wrapper object that has a `free` method that you must call when
 * you're done with the memory.
 */
export interface Freeable {
  free(): void;
}

/**
 * Represents an LLVM module: specifically, and underlying `LLVMModuleRef`.
 */
export class Module extends Ref implements Freeable {
  /**
   * Create a new module.
   */
  static create(name: String) {
    let modref = LLVM.LLVMModuleCreateWithName(name);
    return new Module(modref);
  }

  /**
   * Dump the IR to a file on disk.
   */
  writeBitcodeToFile(filename: string): number {
    return LLVM.LLVMWriteBitcodeToFile(this.ref, filename);
  }

  /**
   * Dump the textual IR to a string.
   */
  toString(): string {
    return LLVM.LLVMPrintModuleToString(this.ref);
  }

  /**
   * Add a function to the module, returning a `Function` wrapper.
   */
  addFunction(name: string, type: any): Function {
    let funcref = LLVM.LLVMAddFunction(this.ref, name, type);
    return new Function(funcref);
  }

  /**
   * Free the memory for this module.
   */
  free() {
    LLVM.LLVMDisposeModule(this.ref);
  }
}

/**
 * Represents an LLVM function, wrapping an `LLVMFunctionRef`.
 */
export class Function extends Ref {
  /**
   * Add a new basic block to this function.
   */
  appendBasicBlock(name: string) {
    let bbref = LLVM.LLVMAppendBasicBlock(this.ref, "entry");
    return new BasicBlock(bbref);
  }
}

export class BasicBlock extends Ref {
}

/**
 * Represents an LLVM IR builder.
 */
export class Builder extends Ref implements Freeable {
  /**
   * Create a new builder.
   */
  static create() {
    let bref = LLVM.LLVMCreateBuilder();
    return new Builder(bref);
  }

  /**
   * Position the builder's insertion point at the end of the given basic block.
   */
  positionAtEnd(bb: BasicBlock) {
    LLVM.LLVMPositionBuilderAtEnd(this.ref, bb.ref);
  }

  /**
   * Build an integer addition instruction.
   */
  add(lhs: Value, rhs: Value, name: string): Value {
    let vref = LLVM.LLVMBuildAdd(this.ref, lhs.ref, rhs.ref, name);
    return new Value(vref);
  }

  /**
   * Build a return instruction.
   */
  ret(arg: Value): any {
    return LLVM.LLVMBuildRet(this.ref, arg.ref);
  }

  /**
   * Free the memory for this builder.
   */
  free() {
    LLVM.LLVMDisposeBuilder(this.ref);
  }
}

/**
 * An LLVM type; wraps `LLVMTypeRef`.
 */
export class Type extends Ref {
  /**
   * Get the i1 type.
   */
  static int1(): Type {
    return new Type(LLVM.LLVMInt1Type());
  }

  /**
   * Get the i8 type.
   */
  static int8(): Type {
    return new Type(LLVM.LLVMInt8Type());
  }

  /**
   * Get the i16 type.
   */
  static int16(): Type {
    return new Type(LLVM.LLVMInt16Type());
  }

  /**
   * Get the i32 type.
   */
  static int32(): Type {
    return new Type(LLVM.LLVMInt32Type());
  }

  /**
   * Get the i64 type.
   */
  static int64(): Type {
    return new Type(LLVM.LLVMInt64Type());
  }

  /**
   * Get the i128 type.
   */
  static int128(): Type {
    return new Type(LLVM.LLVMInt128Type());
  }
}

/**
 * Wraps *any* LLVM value via an `LLVMValueRef`.
 */
export class Value extends Ref {
}

/**
 * Build an integer constant.
 */
export function constInt(value: number, type: Type): Value {
  let vref = LLVM.LLVMConstInt(type.ref, value, false);
  return new Value(vref);
}
