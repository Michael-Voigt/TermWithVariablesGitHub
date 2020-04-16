class term {
	constructor(input) {
		this.list = [];
		
		const regex = RegExp('[+-\/\*^()]');
		
		let l = input.length;
		let j = 0;
		let i = 0;
		
		for (i = 0; i < l; i++) {
			if (regex.test(input[i])) {
				if (i!=j) {
					this.list.push(new termElement(input.substring(j, i)));
				}
				this.list.push(input[i]);
				j = i + 1;
			}
		}
		if (i!=j) {
			this.list.push(new termElement(input.substring(j, l)));
		}
	}
	
	convertToString() {
		let string = [];
		for (let i=0; i < this.list.length; i++) {
			if (typeof(this.list[i])=='string') {
				switch(this.list[i]) {
					// turn +- into -
					case '+':
						if (this.list[i+1].coefficient >= 0) {
							// add + only coefficient >= 0
							// if coefficient < 0 the - comes from convertToString of termElement
							string += this.list[i];									
						}
						break;
					// turn -- into +
					case '-':
						if (this.list[i+1].coefficient < 0) {
							this.list[i+1].coefficient = -this.list[i+1].coefficient; 
							string += '+';									
						}	
						else {
							string += this.list[i];									
						}
						break;
					default:
						string += this.list[i];
				}
			}
			else {
				string += this.list[i].convertToString();								
			}
		}
		return(string);
	}
	
	calculate() {
		console.log('----- Start of Calculate -----');
		compute_brackets(this.list, 0);
		console.log('----- End of Calculate -----');

		function compute_brackets(List, start) {
			let i = start;
			
			while (i < List.length && List[i]!=')') {
				if (List[i] == '(') { 
					compute_brackets(List, i+1);
					// remove brackets if only one operand in brackets
					if (List[i+2] == ')') {
						List.splice(i+2, 1);
						List.splice(i,1);	
					}
					else {
						// find next closing bracket
						while (i < List.length && List[i]!=')') {
							i++;
						}
						// skip over next closing bracket
						i++;
					}
				}
				i++;
			}
			compute_operators(List, start, i-1);
		}
		
		function compute_operators(list, start, end) {
			end = expand_brackets(list, start, end);
			
			// excution order: power of, multiplying / deviding, plus / minus			
			let operators = [RegExp('\^'), RegExp('[\/\*]'), RegExp('[+-]')];

			for (let op = 0; op < operators.length; op++){
				// start with first operator
				let i = start + 1;
				
				while (i < end){
					let result = new termElement('0');
					// execute only operators selected by parameter operators
//							if (operators[op].test(list[i])) {
					if ((operators[op].test(list[i]) && op > 0) ||
						(list[i] == '^' && op == 0)) {
						if (op == 2) {
							// add all operands in list
							let j = i + 1;
							while (j <= end) {
								console.log('Try adding / substracting i-1=' + (i-1) + ': ' + list[i-1].convertToString() + '   j=' + j + ': ' + list[j].convertToString());
								if (i > 1 && list[i-2] =='-') {
									// if op1 == - than turn op2 from - to +
									if (list[j-1] == '-') {
										result.operation(list[i-1], '+', list[j]);												
									}
									// if op1 == - than turn op2 from + to -
									else {
										result.operation(list[i-1], '-', list[j]);													
									}
								}
								else {
									// calculate result = operand1 operation operand2
									result.operation(list[i-1], list[j-1], list[j]);
								}
								// if operation is successful, replace operand1, operator and operand2 by result
								if (result.coefficient != null) {
									// replace operand1 by result
									list.splice(i-1, 1 ,result);
									// remove operator and operand2
									list.splice(j-1, 2);											
									end -=2;
									result = new termElement('0');
									console.log('Result: ' + list[i-1].convertToString());
								}
								else {
									j+=2;
								}
							}
							i+=2;									
						}
						else {
							console.log('Compute: ' + list[i-1].convertToString(), list[i], list[i+1].convertToString());
							// calculate result = operand1 operation operand2
							result.operation(list[i-1], list[i], list[i+1]);
							if (result.coefficient != null) {
								// replace operand1, operator and operand2 by result
								list.splice(i-1,3,result);
								end -=2;
								console.log('Result: ' + list[i-1].convertToString());
							}
							else {
								i+=2;
							}
						}
					}
					else {
					// next operator
					i+=2;
					}
				}
			}
		}
		
		function expand_brackets_old(list, start, end) {
			let operator ='';
			let openingBracket1 = -1;
			let closingBracket1 = -1;
			let openingBracket2 = -1;
			let closingBracket2 = -1;
			let operators = RegExp('[\/\*+-]');
//			let operators = RegExp('[\/\*]');
			let opMultiplyDivide = RegExp('[\/\*]');

// y+a*(b+c)+x
// y+(a+b)*c+x
			let i = start;
			while (i < end) {
				// try to find brackets
				while (i < end && list[i]!='(') {
					i++;
				}
				if (list[i]=='(') {
					if (start <= i-2 && operators.test(list[i-1])) {
						operator = list[i-1];
						if (start <= i-2 && list[i-2] == ')') {
							// found )*( in (a+b)*(c+d)
							openingBracket2 = i+1;
							closingBracket1 = i-3;									
						}
						else {
							// found a*( in a*(b+c)						
							openingBracket1 = i-2;
							closingBracket1 = i-2;
							openingBracket2 = i+1;									
						}
					}
					else {
						openingBracket1 = i+1;	
					}
				}
				while (i < end && list[i]!=')') {
					i++;
				}
				if (list[i]==')') {
					if (closingBracket1 == -1) {
						closingBracket1 = i-1;
						if (i+2 <= end && operators.test(list[i+1]) && list[i+2] != '(') {
							// found )*c in y+(a+b)*c
							operator = list[i+1];
							openingBracket2 = i+2;
							closingBracket2 = i+2;
							i+=2;
						}
					}
					else {
						closingBracket2 = i-1;
//						operator = list[i+1]
					}
				}
				// if brackets found, expand them
				if (closingBracket2 !=-1) {
					console.log('openingBracket1: ' + openingBracket1 + ' closingBracket1: ' + closingBracket1);
					console.log('openingBracket2: ' + openingBracket2 + ' closingBracket2: ' + closingBracket2);

					// add opening bracket
					
					switch(operator) {
						case '+':
						case '-':
							i = closingBracket2 + 2;
							if (openingBracket2 != closingBracket2) {
								// remove brackets								
								if (operator == '-') {
								  // convert - to + and + to -	
								  for (let j = openingBracket2 + 1; j < closingBracket2; j+=2) {
								  	if (list[j] == '+') {
								  		list[j] = '-';
								  	}
								  	else if (list[j] == '-') {
								  		list[j] = '+';
								  	}
								  }
								}
								list.splice(closingBracket2 + 1, 1);
								list.splice(openingBracket2 - 1, 1);
								i-=2;
								end-=2;
							}
							if (openingBracket1 != closingBracket1) {
								// remove brackets
								list.splice(closingBracket1 + 1, 1);
								list.splice(openingBracket1 - 1, 1);
								i-=2;
								end-=2;
							}
							// reset brackets
							openingBracket1 = -1;
							closingBracket1 = -1;
							openingBracket2 = -1;
							closingBracket2 = -1;
							break;
						case '*':
						case '/':
							let bracket1 = openingBracket1;
							let bracket2 = openingBracket2;
							let insert = 0;
							let sign1 = '+';
							let sign2 = '+';
							// let signBeforeBracket ='+';
							// // check if the sign before bracket2 is a minus
							// if (openingBracket1==closingBracket1) {
							// 	if (list[openingBracket1 - 1] =='-') {
							// 		signBeforeBracket='-';	
							// 	}								
							// }
							// else {
							// 	if (list[openingBracket1 - 2] =='-') {
							// 		signBeforeBracket='-';	
							// 	}									
							// }

							// expand brackets	

							while (bracket1 <= closingBracket1) {
								bracket2 = openingBracket2;	
								sign2 = '+';
								while (bracket2 <= closingBracket2) {
									let result = new termElement('0');
									result.operation(list[bracket1], operator, list[bracket2]);	
									if (bracket1!=openingBracket1) {
										sign1 = list[bracket1 - 1];
									}
									if (bracket2!=openingBracket2) {
										sign2 = list[bracket2 - 1];
									}
									if ((sign1 == '+' && sign2 == '-') || (sign1 == '-' && sign2 == '+')) {
										result.coefficient = - result.coefficient;
									}
									console.log('Result: ' + result.convertToString());
									// determine position to insert result
									if (openingBracket2 == closingBracket2 ) {
										// no closing bracket
										list.splice(closingBracket2+1,0,result);	
									}
									else {
										list.splice(closingBracket2+2,0,result);
									}
									insert++;
									if (bracket1 != openingBracket1 || bracket2 != openingBracket2) {
										// determine position to insert +
										if (openingBracket2 == closingBracket2 ) {
											// no closing bracket
											list.splice(closingBracket2+2,0,'+');	
										}
										else {
											list.splice(closingBracket2+3,0,'+');
										}
										insert++;
									}
									bracket2+=2;
								}
								bracket1+=2;
							}
							
							// add closing bracket
							
							// remove brackets
							if (openingBracket1 != closingBracket1) {
								openingBracket1--;
							}
							if (openingBracket2 != closingBracket2) {
								closingBracket2++;
							}
							end+=insert;
							list.splice(openingBracket1, closingBracket2 - openingBracket1 + 1);
							end-=closingBracket2 - openingBracket1 + 1;	
							
							// start: openingBracket1
							// end: openingBracket1 + insert
		
							i = openingBracket1 + insert;
							
							// if next operation is * or / than insert opening and closing bracket
							if (opMultiplyDivide.test(list[i])) {
								list.splice(i,0,')');
								list.splice(openingBracket1,0,'(');
								end+=2;
								// continue processing at the first opening bracket
								i = openingBracket1;
							}
							// reset brackets
							openingBracket1 = -1;
							closingBracket1 = -1;
							openingBracket2 = -1;
							closingBracket2 = -1;
							break;
					}
				}							
			}
			return(end);
		}
		
		function expand_brackets(list, start, end) {
			let operator ='';
			let openingBracket1 = -1;
			let closingBracket1 = -1;
			let openingBracket2 = -1;
			let closingBracket2 = -1;
//			let operators = [RegExp('\^'), RegExp('[\/\*]'), RegExp('[+-]')];
			let operators = [RegExp('[\/\*]'), RegExp('[+-]')];
			let opMultiplyDivide = RegExp('[\/\*]');

			for (let op = 0; op < operators.length; op++){
				let i = start;
				while (i < end) {
					// try to find brackets
					while (i < end && list[i]!='(') {
						i++;
					}
					if (list[i]=='(') {
						if (start <= i-2 && operators[op].test(list[i-1])) {
							operator = list[i-1];
							if (start <= i-2 && list[i-2] == ')') {
								// found )*( in (a+b)*(c+d)
								openingBracket2 = i+1;
								closingBracket1 = i-3;									
							}
							else {
								// found a*( in a*(b+c)						
								openingBracket1 = i-2;
								closingBracket1 = i-2;
								openingBracket2 = i+1;									
							}
						}
						else {
							openingBracket1 = i+1;	
						}
					}
					while (i < end && list[i]!=')') {
						i++;
					}
					if (list[i]==')') {
						if (closingBracket1 == -1) {
							closingBracket1 = i-1;
							if (i+2 <= end && operators[op].test(list[i+1]) && list[i+2] != '(') {
								// found )*c in y+(a+b)*c
								operator = list[i+1];
								openingBracket2 = i+2;
								closingBracket2 = i+2;
								i+=2;
							}
						}
						else {
							closingBracket2 = i-1;
	//						operator = list[i+1]
						}
					}
					// if brackets found, expand them
					if (closingBracket2 !=-1) {
						console.log('openingBracket1: ' + openingBracket1 + ' closingBracket1: ' + closingBracket1);
						console.log('openingBracket2: ' + openingBracket2 + ' closingBracket2: ' + closingBracket2);
	
						// add opening bracket
						
						switch(operator) {
							case '+':
							case '-':
								i = closingBracket2 + 2;
								if (openingBracket2 != closingBracket2) {
									// remove brackets								
									if (operator == '-') {
									  // convert - to + and + to -	
									  for (let j = openingBracket2 + 1; j < closingBracket2; j+=2) {
									  	if (list[j] == '+') {
									  		list[j] = '-';
									  	}
									  	else if (list[j] == '-') {
									  		list[j] = '+';
									  	}
									  }
									}
									list.splice(closingBracket2 + 1, 1);
									list.splice(openingBracket2 - 1, 1);
									i-=2;
									end-=2;
								}
								if (openingBracket1 != closingBracket1) {
									// remove brackets
									list.splice(closingBracket1 + 1, 1);
									list.splice(openingBracket1 - 1, 1);
									i-=2;
									end-=2;
								}
								// reset brackets
								openingBracket1 = -1;
								closingBracket1 = -1;
								openingBracket2 = -1;
								closingBracket2 = -1;
								break;
							case '*':
							case '/':
								let bracket1 = openingBracket1;
								let bracket2 = openingBracket2;
								let insert = 0;
								let sign1 = '+';
								let sign2 = '+';
								// let signBeforeBracket ='+';
								// // check if the sign before bracket2 is a minus
								// if (openingBracket1==closingBracket1) {
								// 	if (list[openingBracket1 - 1] =='-') {
								// 		signBeforeBracket='-';	
								// 	}								
								// }
								// else {
								// 	if (list[openingBracket1 - 2] =='-') {
								// 		signBeforeBracket='-';	
								// 	}									
								// }
	
								// expand brackets	
	
								while (bracket1 <= closingBracket1) {
									bracket2 = openingBracket2;	
									sign2 = '+';
									while (bracket2 <= closingBracket2) {
										let result = new termElement('0');
										result.operation(list[bracket1], operator, list[bracket2]);	
										if (bracket1!=openingBracket1) {
											sign1 = list[bracket1 - 1];
										}
										if (bracket2!=openingBracket2) {
											sign2 = list[bracket2 - 1];
										}
										if ((sign1 == '+' && sign2 == '-') || (sign1 == '-' && sign2 == '+')) {
											result.coefficient = - result.coefficient;
										}
										console.log('Result: ' + result.convertToString());
										// determine position to insert result
										if (openingBracket2 == closingBracket2 ) {
											// no closing bracket
											list.splice(closingBracket2+1,0,result);	
										}
										else {
											list.splice(closingBracket2+2,0,result);
										}
										insert++;
										if (bracket1 != openingBracket1 || bracket2 != openingBracket2) {
											// determine position to insert +
											if (openingBracket2 == closingBracket2 ) {
												// no closing bracket
												list.splice(closingBracket2+2,0,'+');	
											}
											else {
												list.splice(closingBracket2+3,0,'+');
											}
											insert++;
										}
										bracket2+=2;
									}
									bracket1+=2;
								}
								
								// add closing bracket
								
								// remove brackets
								if (openingBracket1 != closingBracket1) {
									openingBracket1--;
								}
								if (openingBracket2 != closingBracket2) {
									closingBracket2++;
								}
								end+=insert;
								list.splice(openingBracket1, closingBracket2 - openingBracket1 + 1);
								end-=closingBracket2 - openingBracket1 + 1;	
								
								// start: openingBracket1
								// end: openingBracket1 + insert
			
								i = openingBracket1 + insert;
								
								// if next operation is * or / than insert opening and closing bracket
								if (opMultiplyDivide.test(list[i])) {
									list.splice(i,0,')');
									list.splice(openingBracket1,0,'(');
									end+=2;
									// continue processing at the first opening bracket
									i = openingBracket1;
								}
								// if there's a - in front of the bracket than insert opening and closing bracket
								else if (openingBracket1 > 1 && list[openingBracket1 - 1] =='-') {
									list.splice(i,0,')');
									list.splice(openingBracket1,0,'(');
									end+=2;
									i+=2;
								}								

								// reset brackets
								openingBracket1 = -1;
								closingBracket1 = -1;
								openingBracket2 = -1;
								closingBracket2 = -1;
								break;
						}
					}							
				}
			}
			return(end);
		}
	}
}