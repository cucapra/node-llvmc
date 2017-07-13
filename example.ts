import * as llvmc from './lib/wrapped';

// Create a module.
let mod = llvmc.Module.create("some_module");

// Dance to set the target triple and data layout.
// First, we initialize the x86 target. (This is hard-coded for now; the C API
// doesn't seem to have a way to initialize the default target. [TODO])
llvmc.initX86Target();

// Get the target triple and data layout for the default target (i.e., the
// target for the current host machine).
let target_triple = llvmc.TargetMachine.getDefaultTargetTriple();
let target = llvmc.Target.getFromTriple(target_triple);
let target_machine = llvmc.TargetMachine.create(target, target_triple);
let data_layout = target_machine.createDataLayout();
let data_layout_s = data_layout.toString();

// Set the target triple and data layout for the module.
mod.setTarget(target_triple);
mod.setDataLayout(data_layout_s);

// Add a function to the module.
let paramtypes = new Buffer(0);
let functype = llvmc.FunctionType.create(llvmc.IntType.int32(), []);
let main = mod.addFunction("main", functype);

// Add a single basic block to the function.
let entry = main.appendBasicBlock("entry");

// Build a tiny program in the block.
let builder = llvmc.Builder.create();
builder.positionAtEnd(entry);
let arg1 = llvmc.ConstInt.create(34, llvmc.IntType.int32());
let arg2 = llvmc.ConstInt.create(8, llvmc.IntType.int32());
let sum = builder.add(arg1, arg2, "sum");
builder.ret(sum);
builder.free();

// Dump the IR as bitcode to disk.
let err = mod.writeBitcodeToFile("out.bc");
if (err) {
  console.error("write failed", err);
}

// Write the IR as text to the console.
console.log(mod.toString());

mod.free();
