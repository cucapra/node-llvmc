/**
 * The tokens in the language.
 */
export interface Token {
  id: string;
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

/**
 * Check whether str is a single alphabetic character.
 */
function isAlpha(str: string): boolean {
  return str.length === 1 && str.match(/[a-z]/i) !== null;
}

/**
 * Check whether str is a single alphanumeric character.
 */
function isAlNum(str: string): boolean {
  return str.length === 1 && str.match(/[a-z0-9]/i) !== null;
}

/*
* Check whether str is one character and a digit.
*/
function isDigit(str: string): boolean {
  return str.length === 1 && str.match(/[0-9]/i) !== null;
}

/**
 * The lexer state itself.
 */
export class Lexer {
  prog: string;  // program to run
  lastChar: string = ' ';  // contains last char read (' ' to start)
  idx: number = 0;  // where we are in program
  EOF: string = '';

  numVal: number;  // filled with last number seen
  idStr: string;  // filled with last variable id seen

  /**
   * Reset the lexer to read a new program.
   */
  reset(_prog: string) {
    this.prog = _prog;
    this.lastChar = ' ';
    this.idx = 0;
  }

  /*
  * Getters and setters for numVal / idStr
  */
  getNumVal(): number { return this.numVal; }
  setNumVal(val: number): void { this.numVal = val; }
  getIdStr(): string { return this.idStr; }
  setIdStr(id: string): void { this.idStr = id; }

  /*
  * Read and return next char of program (return EOF if at end of program)
  */
  getChar(): string {
    if (this.idx < this.prog.length) {
      let result: string = this.prog.charAt(this.idx);
      this.idx += 1;
      return result;
    }
    return this.EOF;
  };

  /*
   * Retrive the next token.
   */
  getTok(): Token {
    // skip whitespace
    while (this.lastChar === ' ')
      this.lastChar = this.getChar();

    // identifier: [a-zA-Z][a-zA-Z0-9]*
    if (isAlpha(this.lastChar)) {
      this.idStr = this.lastChar;
      while (isAlNum((this.lastChar = this.getChar())))
        this.idStr += this.lastChar;

      if (this.idStr === "def")
        return new Tok_Def();
      if (this.idStr === "extern")
        return new Tok_Ext();
      return new Tok_Id();
    }

    // number: [0-9.]+
    let seenDecimal: boolean = false;
    if (isDigit(this.lastChar) || this.lastChar === '.') {
      let numStr: string = '';
      do {
        seenDecimal = (this.lastChar === '.') ? true : seenDecimal;
        numStr += this.lastChar;
        this.lastChar = this.getChar();
        if (this.lastChar === '.' && seenDecimal) {
          throw 'Too many decimal points';
        }
      } while (isDigit(this.lastChar) || this.lastChar === '.');

      // we have seen a number token, so set numVal
      this.numVal = parseFloat(numStr);
      return new Tok_Number();
    }

    // check for end of file
    if (this.lastChar === this.EOF)
      return new Tok_Eof();

    // Otherwise, just return the character as its ascii value
    let thisChar: string = this.lastChar;
    this.lastChar = this.getChar();
    return new Tok_Other(thisChar);
  }

}
