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
 * Represents an LLVM module: specifically, and underlying `LLVMModuleRef`.
 */
export class Module extends Ref {
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
export class Builder extends Ref {
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
   * Build an integer constant.
   */
  constInt32(value: number): any {
    return LLVM.LLVMConstInt(LLVM.LLVMInt32Type(), value, false);
  }

  /**
   * Build an integer addition instruction.
   */
  add(lhs: any, rhs: any, name: string): any {
    return LLVM.LLVMBuildAdd(this.ref, lhs, rhs, name);
  }

  /**
   * Build a return instruction.
   */
  ret(arg: any): any {
    return LLVM.LLVMBuildRet(this.ref, arg);
  }

  /**
   * Free the memory for this builder.
   */
  free() {
    LLVM.LLVMDisposeBuilder(this.ref);
  }
}
