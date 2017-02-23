import * as ffi from 'ffi';
import * as ref from 'ref';

// Some useful types.
let voidp = ref.refType(ref.types.void);  // Pointer to an opaque LLVM value.
let void_ = ref.types.void;

export const LLVM = ffi.Library('libLLVM', {
  // Modules.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreModule.html
  'LLVMModuleCreateWithName':   [voidp, ['string']],
  'LLVMCloneModule':            [voidp, [voidp]],
  'LLVMDisposeModule':          [void_, [voidp]],
  'LLVMGetDataLayout':          ['string', [voidp]],
  'LLVMSetDataLayout':          [void_, [voidp, 'string']],
  'LLVMGetTarget':              ['string', [voidp]],
  'LLVMSetTarget':              [void_, [voidp, 'string']],
  'LLVMDumpModule':             [void_, [voidp]],
  'LLVMPrintModuleToString':    ['string', [voidp]],
  'LLVMWriteBitcodeToFile':     ['int', [voidp, 'string']],
  'LLVMAddFunction':            [voidp, [voidp, 'string', voidp]],

  // Function types.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeFunction.html
  'LLVMFunctionType':           [voidp, [voidp, voidp, 'uint', 'bool']],

  // Basic blocks.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueBasicBlock.html
  'LLVMAppendBasicBlock':       [voidp, [voidp, 'string']],

  // Instruction builder.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreInstructionBuilder.html
  'LLVMCreateBuilder':          [voidp, []],
  'LLVMPositionBuilder':        [void_, [voidp, voidp, voidp]],
  'LLVMPositionBuilderBefore':  [void_, [voidp, voidp]],
  'LLVMPositionBuilderAtEnd':   [void_, [voidp, voidp]],
  'LLVMDisposeBuilder':         [void_, [voidp]],
  'LLVMBuildAdd':               [voidp, [voidp, voidp, voidp, 'string']],
  'LLVMBuildRet':               [voidp, [voidp, voidp]],

  // Scalar constants.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantScalar.html
  'LLVMConstInt':               [voidp, [voidp, 'ulonglong', 'bool']],

  // Types.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeInt.html
  'LLVMInt1Type':               [voidp, []],
  'LLVMInt8Type':               [voidp, []],
  'LLVMInt16Type':              [voidp, []],
  'LLVMInt32Type':              [voidp, []],
  'LLVMInt64Type':              [voidp, []],
  'LLVMInt128Type':             [voidp, []],
});

/**
 * Represents an LLVM module: specifically, and underlying `LLVMModuleRef`.
 */
export class Module {
  /**
   * Wrap an LLVMModuleRef.
   */
  constructor(public ref: any) {}
  
  /**
   * Create a new module.
   */
  static create(name: String) {
    let modref = LLVM.LLVMModuleCreateWithName(name);
    return new Module(modref);
  }

  /**
   * Free the memory for this module.
   */
  free() {
    LLVM.LLVMDisposeModule(this.ref);
  }
}

/**
 * Represents an LLVM IR builder.
 */
export class Builder {
  /**
   * Wrap an LLVMBuilderRef.
   */
  constructor (public ref: any) {}

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
  positionAtEnd(bbref: any) {
    LLVM.LLVMPositionBuilderAtEnd(this.ref, bbref);
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
