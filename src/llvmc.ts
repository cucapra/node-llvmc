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
let boolp = ref.refType('bool');
let uintp = ref.refType('uint');
let stringp = ref.refType('string');
let voidp = ref.refType(ref.types.void);  // Pointer to an opaque LLVM value.
let voidpp = ref.refType(voidp);  // void**, used for arrays and out-parameters.
let void_ = ref.types.void;

export const LLVM = ffi.Library('libLLVM', {
  // Analysis
  // todo

  // Bit Reader
  // todo

  // Bit Writer
  // todo

  // Transforms
  // todo

  // Interprocedural transformations
  // todo

  // Pass manager builder
  // todo

  // Scalar transformations
  // todo

  // Vectorization transformation
  // todo

  // Core
  // http://llvm.org/docs/doxygen/html/group__LLVMCCore.html
  'LLVMInitializeCore':              [void_, [voidp]],
  'LLVMShutdown':                    [void_, [void_]],
  'LLVMCreateMessage':               ['string', ['string']],
  'LLVMDisposeMessage':              [void_, ['string']],

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
  'LLVMPrintModuleToFile':              ['bool', [voidp, 'string', stringp]],
  'LLVMPrintModuleToString':            ['string', [voidp]],
  'LLVMSetModuleInlineAsm':             [void_, [voidp, 'string']],
  'LLVMGetModuleContext':               [voidp, [voidp]],
  'LLVMGetTypeByName':                  [voidp, [voidp, 'string']],
  'LLVMGetNamedMetadataNumOperands':    ['uint', [voidp, 'string']],
  'LLVMGetNamedMetadataOperands':       [void_, [voidp, 'string', voidpp]], 
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
  'LLVMGetTypeKind':            ['int', [voidp]],
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
  'LLVMFunctionType':           [voidp, [voidp, voidpp, 'uint', 'bool']],
  'LLVMIsFunctionVarArg':       ['bool', [voidp]],                                      
  'LLVMGetReturnType':          [voidp, [voidp]],
  'LLVMCountParamTypes':        ['uint', [voidp]],
  'LLVMGetParamTypes':          [void_, [voidp, voidpp]],

  // Structure Types
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreTypeStruct.html
  'LLVMStructTypeInContext':      [voidp, [voidp, voidpp, 'uint', 'bool']],
  'LLVMStructType':               [voidp, [voidpp, 'uint', 'bool']],
  'LLVMStructCreateNamed':        [voidp, [voidp, 'string']],
  'LLVMGetStructName':            ['string', [voidp]],
  'LLVMStructSetBody':            [void_, [voidp, voidpp, 'uint', 'bool']], 
  'LLVMCountStructElementTypes':  ['uint', [voidp]],
  'LLVMGetStructElementTypes':    [void_, [voidp, voidpp]],
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

  // Values
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValues.html
  // #define   LLVM_FOR_EACH_VALUE_SUBCLASS(macro)

  // General APIs
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueGeneral.html
  // #define   LLVM_DECLARE_VALUE_CAST(name)   LLVMValueRef LLVMIsA##name(LLVMValueRef Val);
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
  'LLVMConstIntOfArbitraryPrecision':   [voidp, [voidp, 'uint', 'uint64']],
  'LLVMConstIntOfString':               [voidp, [voidp, 'string', 'uint8']],
  'LLVMConstIntOfStringAndSize':        [voidp, [voidp, 'string', 'uint', 'uint8']],
  'LLVMConstReal':                      [voidp, [voidp, 'double']],
  'LLVMConstRealOfString':              [voidp, [voidp, 'string']],
  'LLVMConstRealOfStringAndSize':       [voidp, [voidp, 'string', 'uint']],
  'LLVMConstIntGetZExtValue':           ['ulonglong', [voidp]],
  'LLVMConstIntGetSExtValue':           ['longlong', [voidp]],
  'LLVMConstRealGetDouble':             ['double', [voidp, boolp]],
  
  // Composite Constants
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantComposite.html
  'LLVMConstStringInContext':   [voidp, [voidp, 'string', 'uint', 'bool']],
  'LLVMConstString':            [voidp, ['string', 'uint', 'bool']],
  'LLVMIsConstantString':       ['bool', [voidp]],
  'LLVMGetAsString':            ['string', [voidp, 'size_t']],
  'LLVMConstStructInContext':   [voidp, [voidp, voidpp, 'uint', 'bool']],
  'LLVMConstStruct':            [voidp, [voidpp, 'uint', 'bool']],
  'LLVMConstArray':             [voidp, [voidp, voidpp, 'uint']], 
  'LLVMConstNamedStruct':       [voidp, [voidp, voidpp, 'uint']], 
  'LLVMGetElementAsConstant':   [voidp, [voidp, 'uint']],
  'LLVMConstVector':            [voidp, [voidpp, 'uint']],
  
  // Constant Expression
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantExpressions.html
  'LLVMGetConstOpcode':         ['int', [voidp]],
  'LLVMAlignOf':                [voidp, [voidp]],
  'LLVMSizeOf':                 [voidp, [voidp]],
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
  'LLVMConstICmp':              [voidp, ['int', voidp, voidp]], 
  'LLVMConstFCmp':              [voidp, ['int', voidp, voidp]],
  'LLVMConstShl':               [voidp, [voidp, voidp]],
  'LLVMConstLShr':              [voidp, [voidp, voidp]],
  'LLVMConstAShr':              [voidp, [voidp, voidp]],
  'LLVMConstGEP':               [voidp, [voidp, voidpp, 'uint']],
  'LLVMConstInBoundsGEP':       [voidp, [voidp, voidpp, 'uint']],
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
  'LLVMConstExtractValue':      [voidp, [voidp, uintp, 'uint']],
  'LLVMConstInsertValue':       [voidp, [voidp, voidp, uintp, 'uint']], 
  'LLVMConstInlineAsm':         [voidp, [voidp, 'string', 'string', 'bool', 'bool']],
  'LLVMBlockAddress':           [voidp, [voidp, voidp]],

  // Global Values
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueConstantGlobals.html
  'LLVMGetGlobalParent':         [voidp, [voidp]],
  'LLVMIsDeclaration':           ['bool', [voidp]],
  'LLVMGetLinkage':              ['int', [voidp]],
  'LLVMSetLinkage':              [void_, [voidp, 'int']], 
  'LLVMGetSection':              ['string', [voidp]],
  'LLVMSetSection':              [void_, [voidp, 'string']],
  'LLVMGetVisibility':           ['int', [voidp]],
  'LLVMSetVisibility':           [void_, [voidp, 'int']],
  'LLVMGetDLLStorageClass':      ['int', [voidp]], 
  'LLVMSetDLLStorageClass':      [void_, [voidp, 'int']], 
  'LLVMHasUnnamedAddr':          ['bool', [voidp]],
  'LLVMSetUnnamedAddr':          [void_, [voidp, 'bool']],
  'LLVMGetAlignment':            ['uint', [voidp]],
  'LLVMSetAlignment':            [void_, [voidp, 'uint']],

  // Values with alignments
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueWithAlignment.html
  // empty

  // Global Variables
  // http://llvm.org/docs/doxygen/html/group__LLVMCoreValueConstantGlobalVariable.html
  'LLVMAddGlobal':                [voidp, [voidp, voidp, 'string']],
  'LLVMAddGlobalInAddressSpace':  [voidp, [voidp, voidp, 'string', 'uint']],
  'LLVMGetNamedGlobal':           [voidp, [voidp, 'string']],
  'LLVMGetFirstGlobal':           [voidp, [voidp]],
  'LLVMGetLastGlobal':            [voidp, [voidp]],
  'LLVMGetNextGlobal':            [voidp, [voidp]],
  'LLVMGetPreviousGlobal':        [voidp, [voidp]],
  'LLVMDeleteGlobal':             [void_, [voidp]],
  'LLVMGetInitializer':           [voidp, [voidp]],
  'LLVMSetInitializer':           [void_, [voidp, voidp]],
  'LLVMIsThreadLocal':            [void_, [voidp]],
  'LLVMSetThreadLocal':           [void_, [voidp, 'bool']],
  'LLVMIsGlobalConstant':         ['bool', [voidp]],   
  'LLVMSetGlobalConstant':        [void_, [voidp, 'bool']],
  'LLVMGetThreadLocalMode':       ['int', [voidp]], 
  'LLVMSetThreadLocalMode':       [void_, [voidp, 'int']],
  'LLVMIsExternallyInitialized':  ['bool', [voidp]],
  'LLVMSetExternallyInitialized': [void_, [voidp, 'bool']],

  // Global Aliases
  // http://llvm.org/docs/doxygen/html/group__LLVMCoreValueConstantGlobalAlias.html
  'LLVMAddAlias':                 [voidp, [voidp, voidp, voidp, 'string']],

  // Function Values
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueFunction.html
  'LLVMDeleteFunction':                 [void_, [voidp]], 
  'LLVMGetPersonalityFn':               [voidp, [voidp]],
  'LLVMSetPersonalityFn':               [void_, [voidp, voidp]],
  'LLVMGetIntrinsicID':                 ['uint', [voidp]],
  'LLVMGetFunctionCallConv':            ['uint', [voidp]],
  'LLVMSetFunctionCallConv':            [void_, [voidp, 'uint']],
  'LLVMGetGC':                          ['string', [voidp]],
  'LLVMSetGC':                          [void_, [voidp, 'string']], 
  'LLVMAddFunctionAttr':                [void_, [voidp, 'int']], 
  'LLVMAddTargetDependentFunctionAttr': [void_, [voidp, 'string', 'string']], 
  'LLVMGetFunctionAttr':                ['int', [voidp]], 
  'LLVMRemoveFunctionAttr':             [void_, [voidp, 'int']],

  // Function Parameters
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueFunctionParameters.html 
  'LLVMCountParams':              ['uint', [voidp]],
  'LLVMGetParams':                [void_, [voidp, voidpp]],
  'LLVMGetParam':                 [voidp, [voidp, 'uint']],
  'LLVMGetParamParent':           [voidp, [voidp]],  
  'LLVMGetFirstParam':            [voidp, [voidp]],  
  'LLVMGetLastParam':             [voidp, [voidp]],  
  'LLVMGetNextParam':             [voidp, [voidp]],  
  'LLVMGetPreviousParam':         [voidp, [voidp]],  
  'LLVMAddAttribute':             [void_, [voidp, 'int']], 
  'LLVMRemoveAttribute':          [void_, [voidp, 'int']], 
  'LLVMGetAttribute':             ['int', [voidp]],
  'LLVMSetParamAlignment':        [void_, [voidp, 'uint']],

  // Metadata
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueMetadata.html
  'LLVMMDStringInContext':        [voidp, [voidp, 'string', 'uint']],
  'LLVMMDString':                 [voidp, ['string', 'uint']],
  'LLVMMDNodeInContext':          [voidp, [voidp, voidpp, 'uint']],
  'LLVMMDNode':                   [voidp, [voidpp, 'uint']],
  'LLVMGetMDString':              ['string', [voidp, uintp]], 
  'LLVMGetMDNodeNumOperands':     ['uint', [voidp]],
  'LLVMGetMDNodeOperands':        [void_, [voidp, voidpp]],

  // Basic blocks.
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueBasicBlock.html
  'LLVMBasicBlockAsValue':           [voidp, [voidp]],
  'LLVMValueIsBasicBlock':           ['bool', [voidp]],
  'LLVMValueAsBasicBlock':           [voidp, [voidp]],
  'LLVMGetBasicBlockParent':         [voidp, [voidp]],
  'LLVMGetBasicBlockTerminator':     [voidp, [voidp]],
  'LLVMCountBasicBlocks':            ['uint', [voidp]],
  'LLVMGetBasicBlocks':              [void_, [voidp, voidpp]], 
  'LLVMGetFirstBasicBlock':          [voidp, [voidp]],
  'LLVMGetLastBasicBlock':           [voidp, [voidp]],
  'LLVMGetNextBasicBlock':           [voidp, [voidp]],
  'LLVMGetPreviousBasicBlock':       [voidp, [voidp]],   
  'LLVMGetEntryBasicBlock':          [voidp, [voidp]],
  'LLVMAppendBasicBlockInContext':   [voidp, [voidp, voidp, 'string']],
  'LLVMAppendBasicBlock':            [voidp, [voidp, 'string']],
  'LLVMInsertBasicBlockInContext':   [voidp, [voidp, voidp, 'string']], 
  'LLVMInsertBasicBlock':            [voidp, [voidp, 'string']],
  'LLVMDeleteBasicBlock':            [void_, [voidp]],
  'LLVMRemoveBasicBlockFromParent':  [void_, [voidp]],
  'LLVMMoveBasicBlockBefore':        [void_, [voidp, voidp]],
  'LLVMMoveBasicBlockAfter':         [void_, [voidp, voidp]], 
  'LLVMGetFirstInstruction':         [voidp, [voidp]],
  'LLVMGetLastInstruction':          [voidp, [voidp]], 

  // Instructions
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueInstruction.html
  'LLVMHasMetadata':                 ['int', [voidp]],
  'LLVMGetMetadata':                 [voidp, [voidp, 'uint']],
  'LLVMSetMetadata':                 [void_, [voidp, 'uint', voidp]],
  'LLVMGetInstructionParent':        [voidp, [voidp]],
  'LLVMGetNextInstruction':          [voidp, [voidp]],
  'LLVMGetPreviousInstruction':      [voidp, [voidp]],
  'LLVMInstructionEraseFromParent':  [void_, [voidp]],
  'LLVMGetInstructionOpcode':        ['int', [voidp]],
  'LLVMGetICmpPredicate':            ['int', [voidp]],
  'LLVMGetFCmpPredicate':            ['int', [voidp]],
  'LLVMInstructionClone':            [voidp, [voidp]],

  // Call sites and Invocations
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueInstructionCall.html
  'LLVMSetInstructionCallConv':      [void_, [voidp, 'uint']],
  'LLVMGetInstructionCallConv':      ['uint', [voidp]],
  'LLVMAddInstrAttribute':           [void_, [voidp, 'uint', 'int']], 
  'LLVMRemoveInstrAttribute':        [void_, [voidp, 'uint', 'int']],
  'LLVMSetInstrParamAlignment':      [void_, [voidp, 'uint', 'uint']],
  'LLVMIsTailCall':                  ['bool', [voidp]],
  'LLVMSetTailCall':                 [void_, [voidp, 'bool']],

  // Terminators
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueInstructionTerminator.html
  'LLVMGetNumSuccessors':       ['uint', [voidp]],
  'LLVMGetSuccessor':           [voidp, [voidp, 'uint']],
  'LLVMSetSuccessor':           [void_, [voidp, 'uint', voidp]],
  'LLVMIsConditional':          ['bool', [voidp]],
  'LLVMGetCondition':           [voidp, [voidp]],
  'LLVMSetCondition':           [void_, [voidp, voidp]],
  'LLVMGetSwitchDefaultDest':   [voidp, [voidp]],

  // PHI Nodes
  // http://llvm.org/docs/doxygen/html/group__LLVMCCoreValueInstructionPHINode.html
  'LLVMAddIncoming':            [void_, [voidp, voidpp, voidpp, 'uint']], 
  'LLVMCountIncoming':          ['uint', [voidp]], 
  'LLVMGetIncomingValue':       [voidp, [voidp, 'uint']],
  'LLVMGetIncomingBlock':       [voidp, [voidp, 'uint']],


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








