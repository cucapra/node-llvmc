import * as llvmc from '../lib/wrapped';
import * as readline from 'readline';
import {Context} from './calculator';

/////////////////////////////////////
// AST
////////////////////////////////////
export interface ASTNode {
  id: string; // type of node
  codegen(context: Context): any;
}

export interface ExprAST extends ASTNode{
  id: string;
  codegen(context: Context) : llvmc.Value;
};

/*
 * VariableExprAST - Expression class for referencing a variable, like "a".
 */
export class VariableExprAST implements ExprAST {
  public id: string = 'NumberExprAST';
    public name: string;

  public constructor(name: string) {this.name = name;}

  public codegen(context: Context) : llvmc.Value {
      // Look this variable up in the function.
      if (!context.namedValues.hasOwnProperty(this.name))
      throw 'unknown variable access'
      return context.namedValues[this.name];
  }
};

/*
 * NumberExprAST - Expression class for numeric literals like "1.0".
 */
export class NumberExprAST implements ExprAST {
  public id: string = 'NumberExprAST';
    public val: number;

  public constructor(val: number) {this.val = val;}

  public codegen(context: Context) : llvmc.Value {
    return llvmc.ConstFloat.create(this.val, llvmc.FloatType.float());
  }
};

/*
 * BinaryExprAST - Expression class for a binary operator.
 */
export class BinaryExprAST implements ExprAST {
  public id: string = 'BinaryExprAST';
    public op: string;
    public left: ExprAST;
    public right: ExprAST;

  public constructor(op: string, left: ExprAST, right: ExprAST) {
    this.op = op;
    this.left = left;
    this.right = right;
  }

  public codegen(context: Context) : llvmc.Value {
    let lVal: llvmc.Value = this.left.codegen(context);
    let rVal: llvmc.Value = this.right.codegen(context);

    if (lVal.ref.isNull() || rVal.ref.isNull())
      throw "null exception"

    switch (this.op) {
      case '+':
        return context.builder.addf(lVal, rVal, 'addtmp');
      case '-':
        return context.builder.subf(lVal, rVal, 'subtmp');
        case '*':
        return context.builder.mulf(lVal, rVal, 'multmp');
        default:
        throw "invalid binary operator";
    }
  }
};

/*
 * CallExprAST - Expression class for function calls.
 */
export class CallExprAST implements ExprAST {
  public id: string = 'CallExprAST';
    public callee: string;
    public args: ExprAST[];

  public constructor(callee: string, args: ExprAST[]) {
    this.callee = callee;
    this.args = args;
  }

  public codegen(context: Context) : llvmc.Value {
    // Look up the name in the global module table.
      let calleeFunc: llvmc.Function = context.mod.getFunction(this.callee);
      if (calleeFunc.ref.isNull())
      throw "unknown function referenced";

      // If argument mismatch error.
      if (calleeFunc.countParams() != this.args.length)
      throw "Incorrect # arguments passed";

      let argsV: llvmc.Value[] = [];
      for (let i = 0; i != this.args.length; ++i) {
      argsV.push(this.args[i].codegen(context));
      if (argsV[argsV.length - 1].ref.isNull())
        throw "null exception"
      }

      return context.builder.buildCall(calleeFunc, argsV, "calltmp");
  }
};

/*
 * PrototypeAST - This class represents the "prototype" for a function,
 * which captures its name, and its argument names (thus implicitly the number
 * of arguments the function takes).
 */
export class PrototypeAST implements ASTNode {
  public id: string = 'PrototypeAST';
    public name: string;
    public args: string[];

  public constructor(name: string, args: string[]) {
    this.name = name;
    this.args = args;
  }

  public codegen(context: Context) : llvmc.Function {
    // Make the function type:  double(double,double) etc.
    let floats: llvmc.Type[] = [];
    for (let i = 0; i < this.args.length; i++)
      floats.push(llvmc.FloatType.float());
      let ft: llvmc.FunctionType = llvmc.FunctionType.create(llvmc.FloatType.float(), floats, false);

      let func: llvmc.Function = context.mod.addFunction(this.name, ft);

      // Set names for all arguments.
    let i = 0;
    for (let param of func.params()) {
        param.setName(this.args[i]);
      ++i;
      }

      return func;
  }
};

/*
 * FunctionAST - This class represents a function definition itself.
 */
export class FunctionAST implements ASTNode {
  public id: string = 'FunctionAST';
    public proto: PrototypeAST;
    public body: ExprAST;

  public constructor(proto: PrototypeAST, body: ExprAST) {
    this.proto = proto;
    this.body = body;
  }

  public codegen(context: Context) : llvmc.Function {
    // First, check for an existing function from a previous 'extern' declaration.
    let func: llvmc.Function = context.mod.getFunction(this.proto.name);

      if (func.ref.isNull())
      func = this.proto.codegen(context);

      if (func.ref.isNull())
      throw "null exception";

      // Create a new basic block to start insertion into.
      let bb: llvmc.BasicBlock = func.appendBasicBlock("entry");
      context.builder.positionAtEnd(bb);

      // Record the function arguments in the NamedValues map.
      context.namedValues = {};
    for (let param of func.params())
      context.namedValues[param.getName()] = param;

      let retVal: llvmc.Value = this.body.codegen(context);
      if (!retVal.ref.isNull()) {
      // Finish off the function.
      context.builder.ret(retVal);
      return func;
      }

      // Error reading body, remove function.
      func.deleteFromParent();
    throw "null exception"
  }
};
