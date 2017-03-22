///////////////////////////////////////
// Setup
///////////////////////////////////////
let prog: string; // program to run
let lastChar: string = ' '; // contains last char read (' ' to start)
let idx: number = 0; // where we are in program
let EOF: string = ''; 

/**
 * reset the lexer to be read new prog
 */
export function reset(_prog: string) {
	prog = _prog;
	lastChar = ' ';
	idx = 0;
}

///////////////////////////////////////
// Tokens
///////////////////////////////////////
export interface Token {
	id : string;
};

/*
 * Token representing end of file
 */
export class Tok_Eof implements Token {
	public id: string = 'Tok_Eof';
};

/* 
 * Token representing variable declaration 
 */
export class Tok_Def implements Token {
	public id: string = 'Tok_Def';
};

/*
 * Token representing extern
 */
export class Tok_Ext implements Token {
	public id: string = 'Tok_Ext'
}

/*
 * Token representing number
 */
export class Tok_Number implements Token {
	public id: string = 'Tok_Number';
};

/*
 * Token representing variable identifier
 */
export class Tok_Id implements Token {
	public id: string = 'Tok_Id';
};

/* 
 * Token representing other things (e.g. parens and operators)
 */
export class Tok_Other implements Token {
	public id: string;

	public constructor(id: string) {this.id = id;}
};

///////////////////////////////////////
// Lexer
///////////////////////////////////////
let numVal: number; // filled with last number seen
let idStr: string;  // filled with last variable id seen

/*
 * Getters and setters for numVal / idStr
 */
export function getNumVal() : number{return numVal;}
export function setNumVal(val: number) : void {numVal = val;}
export function getIdStr() : string {return idStr;}
export function setIdStr(id: string) : void {idStr = id;}

/*
 * Read and return next char of program (return EOF if at end of program)
 */
function getChar() : string {
	if (idx < prog.length) {
		let result: string = prog.charAt(idx);
		idx += 1;
		return result;
	}
	return EOF;
};

/*
 * Check if str is a single alphabetic character
 */
function isAlpha(str : string) : boolean {
	return str.length === 1 && str.match(/[a-z]/i) !== null;
};

/*
 * Check if str is a single alphanumeric character
 */
function isAlNum(str : string) : boolean {
	return str.length === 1 && str.match(/[a-z0-9]/i) !== null;
};

/*
 * Check if str is one character and a digit
 */
function isDigit(str : string) : boolean {
	return str.length === 1 && str.match(/[0-9]/i) !== null;
};


/*
 * Retrive the next token
 */
export function getTok() : Token {
	// skip whitespace
	while (lastChar === ' ') 
		lastChar = getChar();
	
	// identifier: [a-zA-Z][a-zA-Z0-9]*
	if (isAlpha(lastChar)) { 
	  	idStr = lastChar;
		while (isAlNum((lastChar = getChar())))
			idStr += lastChar;

	  	if (idStr === "def")
			return new Tok_Def();
		if (idStr === "extern")
			return new Tok_Ext();
		return new Tok_Id();
	} 

	// number: [0-9.]+
	let seenDecimal: boolean = false;
	if (isDigit(lastChar) || lastChar === '.') {
  		let numStr : string = '';
  		do {
  			seenDecimal = (lastChar === '.') ? true : seenDecimal;
			numStr += lastChar;
			lastChar = getChar();
			if (lastChar === '.' && seenDecimal) {throw 'Too many decimal points';}
  		} while (isDigit(lastChar) || lastChar === '.');

  		// we have seen a number token, so set numVal
  		numVal = parseFloat(numStr);
  		return new Tok_Number();
	}
	
	// check for end of file
	if (lastChar === EOF)
		return new Tok_Eof();

	// Otherwise, just return the character as its ascii value
	let thisChar : string = lastChar;
	lastChar = getChar();
	return new Tok_Other(thisChar);
};