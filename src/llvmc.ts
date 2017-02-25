/**
 * This module contains the low-level FFI declaration for the LLVM C library.
 * You can call the functions on the `LLVM` object contained here to operate
 * directly on LLVM value references.
 * 
 * More convenient wrapper classes are found in the `wrapped` module.
 */

import * as ffi from 'ffi';
import * as ref from 'ref';

// Some useful types.
let voidp = ref.refType(ref.types.void);  // Pointer to an opaque LLVM value.
let void_ = ref.types.void;

export const LLVM = ffi.Library('libLLVM', {
  /* ==============================
   *             Core
   * ============================== */

  // Types and Enumerations
  // todo

  // Contexts
  // todo

  // Modules.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreModule.html
  'LLVMModuleCreateWithName':           [voidp, ['string']],
  'LLVMModuleCreateWithNameInContext':  [voidp, ['string', voidp]],
  'LLVMCloneModule':                    [voidp, [voidp]],
  'LLVMDisposeModule':                  [void_, [voidp]],
  'LLVMGetDataLayout':                  ['string', [voidp]],
  'LLVMSetDataLayout':                  [void_, [voidp, 'string']],
  'LLVMGetTarget':                      ['string', [voidp]],
  'LLVMSetTarget':                      [void_, [voidp, 'string']],
  'LLVMDumpModule':                     [void_, [voidp]],
  // LLVMBool   LLVMPrintModuleToFile (LLVMModuleRef M, const char *Filename, char **ErrorMessage)
  'LLVMPrintModuleToString':            ['string', [voidp]],
  'LLVMSetModuleInlineAsm':             [void_, [voidp, 'string']],
  'LLVMGetModuleContext':               [voidp, [voidp]],
  'LLVMGetTypeByName':                  [voidp, [voidp, 'string']],
  'LLVMGetNamedMetadataNumOperands':    ['uint', [voidp, 'string']],
  // void   LLVMGetNamedMetadataOperands (LLVMModuleRef M, const char *name, LLVMValueRef *Dest)
  'LLVMAddNamedMetadataOperand':        [void_, [voidp, 'string', voidp]],
  'LLVMAddFunction':                    [voidp, [voidp, 'string', voidp]],
  'LLVMGetNamedFunction':               [voidp, [voidp, 'string']],
  'LLVMGetFirstFunction':               [voidp, [voidp]],
  'LLVMGetLastFunction':                [voidp, [voidp]],
  'LLVMGetNextFunction':                [voidp, [voidp]],
  'LLVMGetPreviousFunction':            [voidp, [voidp]],
  'LLVMWriteBitcodeToFile':             ['int', [voidp, 'string']],

  // Types
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreType.html
  // LLVMTypeKind   LLVMGetTypeKind (LLVMTypeRef Ty)
  'LLVMTypeIsSized':            ['bool', [voidp]],                                    
  'LLVMGetTypeContext':         [voidp, [voidp]],
  'LLVMDumpType':               [void_, [voidp]],
  'LLVMPrintTypeToString':      ['string', [voidp]],

  // Integer Types.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeInt.html
  'LLVMInt1TypeInContext':      [voidp, [voidp]],
  'LLVMInt8TypeInContext':      [voidp, [voidp]],
  'LLVMInt16TypeInContext':     [voidp, [voidp]],
  'LLVMInt32TypeInContext':     [voidp, [voidp]],
  'LLVMInt64TypeInContext':     [voidp, [voidp]],
  'LLVMInt128TypeInContext':    [voidp, [voidp]],
  'LLVMIntTypeInContext':       [voidp, [voidp, 'uint']],
  'LLVMInt1Type':               [voidp, []],
  'LLVMInt8Type':               [voidp, []],
  'LLVMInt16Type':              [voidp, []],
  'LLVMInt32Type':              [voidp, []],
  'LLVMInt64Type':              [voidp, []],
  'LLVMInt128Type':             [voidp, []],
  'LLVMIntType':                [voidp, ['uint']],
  'LLVMGetIntTypeWidth':        ['uint', [voidp]],

  // Floating Point Types.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeFloat.html
  'LLVMHalfTypeInContext':      [voidp, [voidp]],
  'LLVMFloatTypeInContext':     [voidp, [voidp]],
  'LLVMDoubleTypeInContext':    [voidp, [voidp]],
  'LLVMX86FP80TypeInContext':   [voidp, [voidp]],
  'LLVMFP128TypeInContext':     [voidp, [voidp]],
  'LLVMPPCFP128TypeInContext':  [voidp, [voidp]],
  'LLVMHalfType':               [voidp, []],
  'LLVMFloatType':              [voidp, []],
  'LLVMDoubleType':             [voidp, []],
  'LLVMX86FP80Type':            [voidp, []],
  'LLVMFP128Type':              [voidp, []],
  'LLVMPPCFP128Type':           [voidp, []],

  // Function types.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeFunction.html
  'LLVMFunctionType':           [voidp, [voidp, voidp, 'uint', 'bool']],
  'LLVMIsFunctionVarArg':       ['bool', [voidp]],                                      
  'LLVMGetReturnType':          [voidp, [voidp]],
  'LLVMCountParamTypes':        ['uint', [voidp]],
  // void   LLVMGetParamTypes (LLVMTypeRef FunctionTy, LLVMTypeRef *Dest)

  // Structure Types
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeStruct.html
  // LLVMTypeRef   LLVMStructTypeInContext (LLVMContextRef C, LLVMTypeRef *ElementTypes, unsigned ElementCount, LLVMBool Packed)
  // LLVMTypeRef   LLVMStructType (LLVMTypeRef *ElementTypes, unsigned ElementCount, LLVMBool Packed)
  'LLVMStructCreateNamed':        [voidp, [voidp, 'string']],
  'LLVMGetStructName':            ['string', [voidp]],
  // void   LLVMStructSetBody (LLVMTypeRef StructTy, LLVMTypeRef *ElementTypes, unsigned ElementCount, LLVMBool Packed)
  'LLVMCountStructElementTypes':  ['uint', [voidp]],
  // void   LLVMGetStructElementTypes (LLVMTypeRef StructTy, LLVMTypeRef *Dest)
  'LLVMStructGetTypeAtIndex':     [voidp, [voidp, 'uint']],
  'LLVMIsPackedStruct':           ['bool', [voidp]],                                   
  'LLVMIsOpaqueStruct':           ['bool', [voidp]],                                   

  // Sequential Types
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeSequential.html
  'LLVMGetElementType':         [voidp, [voidp]],
  'LLVMArrayType':              [voidp, [voidp, 'uint']],
  'LLVMGetArrayLength':         ['uint', [voidp]],
  'LLVMPointerType':            [voidp, [voidp, 'uint']],
  'LLVMGetPointerAddressSpace': ['uint', [voidp]],
  'LLVMVectorType':             [voidp, [voidp, 'uint']],
  'LLVMGetVectorSize':          ['uint', [voidp]],

  // Other Types
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeOther.html
  'LLVMVoidTypeInContext':      [voidp, [voidp]],
  'LLVMLabelTypeInContext':     [voidp, [voidp]],
  'LLVMX86MMXTypeInContext':    [voidp, [voidp]],
  'LLVMVoidType':               [voidp, []],
  'LLVMLabelType':              [voidp, []],
  'LLVMX86MMXType':             [voidp, []],

  // General APIs
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueGeneral.html
  // todo: #define LLVM_DECLARE_VALUE_CAST
  'LLVMTypeOf':                 [voidp, [voidp]],
  'LLVMGetValueName':           ['string', [voidp]],
  'LLVMSetValueName':           [void_, [voidp, 'string']],
  'LLVMDumpValue':              [void_, [voidp]],
  'LLVMPrintValueToString':     ['string', [voidp]],
  'LLVMReplaceAllUsesWith':     [void_, [voidp, voidp]],
  'LLVMIsConstant':             ['bool', [voidp]],                   
  'LLVMIsUndef':                ['bool', [voidp]],                   
  'LLVMIsAMDNode':              [voidp, [voidp]],
  'LLVMIsAMDString':            [voidp, [voidp]],

  // Usage
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueUses.html
  'LLVMGetFirstUse':            [voidp, [voidp]],
  'LLVMGetNextUse':             [voidp, [voidp]],
  'LLVMGetUser':                [voidp, [voidp]],
  'LLVMGetUsedValue':           [voidp, [voidp]],

  // User Value
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueUser.html
  'LLVMGetOperand':             [voidp, [voidp, 'uint']],
  'LLVMGetOperandUse':          [voidp, [voidp, 'uint']],
  'LLVMSetOperand':             [void_, [voidp, 'uint', voidp]],
  'LLVMGetNumOperands':         ['int', [voidp]],

  // Constants
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstant.html
  'LLVMConstNull':              [voidp, [voidp]],
  'LLVMConstAllOnes':           [voidp, [voidp]],
  'LLVMGetUndef':               [voidp, [voidp]],
  'LLVMIsNull':                 ['bool', [voidp]],                                    
  'LLVMConstPointerNull':       [voidp, [voidp]],

  // Scalar constants.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantScalar.html
  'LLVMConstInt':                       [voidp, [voidp, 'ulonglong', 'bool']],
  // LLVMValueRef   LLVMConstIntOfArbitraryPrecision (LLVMTypeRef IntTy, unsigned NumWords, const uint64_t Words[])
  // LLVMValueRef   LLVMConstIntOfString (LLVMTypeRef IntTy, const char *Text, uint8_t Radix)
  // LLVMValueRef   LLVMConstIntOfStringAndSize (LLVMTypeRef IntTy, const char *Text, unsigned SLen, uint8_t Radix)
  'LLVMConstReal':                      [voidp, [voidp, 'double']],
  'LLVMConstRealOfString':              [voidp, [voidp, 'string']],
  'LLVMConstRealOfStringAndSize':       [voidp, [voidp, 'string', 'uint']],
  'LLVMConstIntGetZExtValue':           ['ulonglong', [voidp]],
  'LLVMConstIntGetSExtValue':           ['longlong', [voidp]],
  // double   LLVMConstRealGetDouble (LLVMValueRef ConstantVal, LLVMBool *losesInfo)
  
  // Composite Constants
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantComposite.html
  'LLVMConstStringInContext':   [voidp, [voidp, 'string', 'uint', 'bool']],
  'LLVMConstString':            [voidp, ['string', 'uint', 'bool']],
  'LLVMIsConstantString':       ['bool', [voidp]],
  // const char *   LLVMGetAsString (LLVMValueRef c, size_t *out)
  // LLVMValueRef   LLVMConstStructInContext (LLVMContextRef C, LLVMValueRef *ConstantVals, unsigned Count, LLVMBool Packed)
  // LLVMValueRef   LLVMConstStruct (LLVMValueRef *ConstantVals, unsigned Count, LLVMBool Packed)
  // LLVMValueRef   LLVMConstArray (LLVMTypeRef ElementTy, LLVMValueRef *ConstantVals, unsigned Length)
  // LLVMValueRef   LLVMConstNamedStruct (LLVMTypeRef StructTy, LLVMValueRef *ConstantVals, unsigned Count)
  'LLVMGetElementAsConstant':   [voidp, [voidp, 'uint']],
  // LLVMValueRef   LLVMConstVector (LLVMValueRef *ScalarConstantVals, unsigned Size)
  
  // Constant Expression
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantExpressions.html
  // LLVMOpcode   LLVMGetConstOpcode (LLVMValueRef ConstantVal)
  'LLVMAlignOf':                [voidp, [voidp]],
  'LLVMSizeOf ':                [voidp, [voidp]],
  'LLVMConstNeg':               [voidp, [voidp]],
  'LLVMConstNSWNeg':            [voidp, [voidp]],
  'LLVMConstNUWNeg':            [voidp, [voidp]],
  'LLVMConstFNeg':              [voidp, [voidp]],
  'LLVMConstNot':               [voidp, [voidp]],
  'LLVMConstAdd':               [voidp, [voidp, voidp]],
  'LLVMConstNSWAdd':            [voidp, [voidp, voidp]],
  'LLVMConstNUWAdd':            [voidp, [voidp, voidp]],
  'LLVMConstFAdd':              [voidp, [voidp, voidp]],
  'LLVMConstSub':               [voidp, [voidp, voidp]],
  'LLVMConstNSWSub':            [voidp, [voidp, voidp]],
  'LLVMConstNUWSub':            [voidp, [voidp, voidp]],
  'LLVMConstFSub':              [voidp, [voidp, voidp]],
  'LLVMConstMul':               [voidp, [voidp, voidp]],
  'LLVMConstNSWMul':            [voidp, [voidp, voidp]],
  'LLVMConstNUWMul':            [voidp, [voidp, voidp]],
  'LLVMConstFMul':              [voidp, [voidp, voidp]],
  'LLVMConstUDiv':              [voidp, [voidp, voidp]],
  'LLVMConstSDiv':              [voidp, [voidp, voidp]],   
  'LLVMConstExactSDiv':         [voidp, [voidp, voidp]],
  'LLVMConstFDiv':              [voidp, [voidp, voidp]],
  'LLVMConstURem':              [voidp, [voidp, voidp]],
  'LLVMConstSRem':              [voidp, [voidp, voidp]],   
  'LLVMConstFRem':              [voidp, [voidp, voidp]],
  'LLVMConstAnd':               [voidp, [voidp, voidp]],
  'LLVMConstOr':                [voidp, [voidp, voidp]],
  'LLVMConstXor':               [voidp, [voidp, voidp]],
  // LLVMValueRef   LLVMConstICmp (LLVMIntPredicate Predicate, LLVMValueRef LHSConstant, LLVMValueRef RHSConstant)
  // LLVMValueRef   LLVMConstFCmp (LLVMRealPredicate Predicate, LLVMValueRef LHSConstant, LLVMValueRef RHSConstant)
  'LLVMConstShl':               [voidp, [voidp, voidp]],
  'LLVMConstLShr':              [voidp, [voidp, voidp]],
  'LLVMConstAShr':              [voidp, [voidp, voidp]],
  // LLVMValueRef   LLVMConstGEP (LLVMValueRef ConstantVal, LLVMValueRef *ConstantIndices, unsigned NumIndices)
  // LLVMValueRef   LLVMConstInBoundsGEP (LLVMValueRef ConstantVal, LLVMValueRef *ConstantIndices, unsigned NumIndices)
  'LLVMConstTrunc':             [voidp, [voidp, voidp]],
  'LLVMConstSExt':              [voidp, [voidp, voidp]],
  'LLVMConstZExt':              [voidp, [voidp, voidp]],
  'LLVMConstFPTrunc':           [voidp, [voidp, voidp]],
  'LLVMConstFPExt':             [voidp, [voidp, voidp]],
  'LLVMConstUIToFP':            [voidp, [voidp, voidp]],
  'LLVMConstSIToFP':            [voidp, [voidp, voidp]], 
  'LLVMConstFPToUI':            [voidp, [voidp, voidp]],
  'LLVMConstFPToSI':            [voidp, [voidp, voidp]],
  'LLVMConstPtrToInt':          [voidp, [voidp, voidp]],
  'LLVMConstIntToPtr':          [voidp, [voidp, voidp]],   
  'LLVMConstBitCast':           [voidp, [voidp, voidp]],
  'LLVMConstAddrSpaceCast':     [voidp, [voidp, voidp]],    
  'LLVMConstZExtOrBitCast':     [voidp, [voidp, voidp]],
  'LLVMConstSExtOrBitCast':     [voidp, [voidp, voidp]],
  'LLVMConstTruncOrBitCast':    [voidp, [voidp, voidp]],
  'LLVMConstPointerCast':       [voidp, [voidp, voidp]],
  'LLVMConstIntCast':           [voidp, [voidp, voidp, 'bool']],
  'LLVMConstFPCast':            [voidp, [voidp, voidp]],
  'LLVMConstSelect':            [voidp, [voidp, voidp, voidp]],
  'LLVMConstExtractElement':    [voidp, [voidp, voidp]],
  'LLVMConstInsertElement':     [voidp, [voidp, voidp, voidp]],
  'LLVMConstShuffleVector':     [voidp, [voidp, voidp, voidp]],
  // LLVMValueRef   LLVMConstExtractValue (LLVMValueRef AggConstant, unsigned *IdxList, unsigned NumIdx)
  // LLVMValueRef   LLVMConstInsertValue (LLVMValueRef AggConstant, LLVMValueRef ElementValueConstant, unsigned *IdxList, unsigned NumIdx)
  'LLVMConstInlineAsm':         [voidp, [voidp, 'string', 'string', 'bool', 'bool']],
  'LLVMBlockAddress':           [voidp, [voidp, voidp]],

  // Global Values
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantGlobals.html
  'LLVMGetGlobalParent':         [voidp, [voidp]],
  'LLVMIsDeclaration':           ['bool', [voidp]],
  // LLVMLinkage   LLVMGetLinkage (LLVMValueRef Global)
  // void   LLVMSetLinkage (LLVMValueRef Global, LLVMLinkage Linkage)
  'LLVMGetSection':              ['string', [voidp]],
  'LLVMSetSection':              [void_, [voidp, 'string']],
  // LLVMVisibility   LLVMGetVisibility (LLVMValueRef Global)
  // void   LLVMSetVisibility (LLVMValueRef Global, LLVMVisibility Viz)
  // LLVMDLLStorageClass   LLVMGetDLLStorageClass (LLVMValueRef Global)
  // void   LLVMSetDLLStorageClass (LLVMValueRef Global, LLVMDLLStorageClass Class)
  'LLVMHasUnnamedAddr':           ['bool', [voidp]],
  'LLVMSetUnnamedAddr':           [void_, [voidp, 'bool']],
  'LLVMGetAlignment':             ['uint', [voidp]],
  'LLVMSetAlignment':             [void_, [voidp, 'uint']],

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
});








