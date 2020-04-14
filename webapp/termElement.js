		class termElement {
			constructor(string) {
				this.coefficient = 1;
				this.exponentList = [];
				this.variableList = [];
				
				const number = RegExp('[1-9.]');
				const letter = RegExp('[a-zA-Z]');
				
				let l = string.length;
				
				// Determine coefficient
				let i = 0;
				while (i<l && number.test(string[i])) {
					i++;
				}
				if (i > 0) {
					this.coefficient = Number(string.substring(0, i))
				}
				
				// Determine variables
				let v = i;
				while (i<l && letter.test(string[i])) { 
					this.exponentList.push(1);
					this.variableList.push(string[i])
					i++; 
				}
				// sort variables works only if all exponents = 1
				this.variableList.sort();
				// convert aaa into a^3
				let j = 1;
				while (j < this.variableList.length) {
					if (this.variableList[j-1] == this.variableList[j]) {
						this.variableList.splice(j,1);
						this.exponentList.splice(j,1);
						this.exponentList[j-1]+=1;
					}
					else {
						j++;
					}
				}
			}
			
			convertToString() {
				let string = [];
				// if there are no variables, always output coefficient
				if (this.variableList.length == 0) {
					string = this.coefficient;				
				}
				else {
					// if there are variables and the coefficient = -1, just ouput -
					if (this.coefficient == -1) {
						string = '-';	
					} 
					// if there are variables and the coefficient = 1, don't output the coefficient
					else if (this.coefficient != 1) {
						string = this.coefficient;
					}
				}
				
				for (let i=0; i < this.variableList.length; i++) {
					string += this.variableList[i];
					if (this.exponentList[i] != 1) {
						string +='^';
						string +=this.exponentList[i];						
					}
				}
				return(string);
			}
			
			operation(operand1, operation, operand2) {
				switch(operation) {
					case '^':
						if (operand2.variableList.length == 0) {
							// power of 0 -> result = 1
							if (operand2.coefficient == 0) {
								this.coefficient = 1;
								this.variableList = [];
								this.exponentList = [];
							} 
							else {
								this.coefficient = Math.pow(operand1.coefficient,operand2.coefficient);
								if (operand1.variableList.length > 0) {
									for (let i = 0; i < operand1.variableList.length; i++) {
										this.variableList.push(operand1.variableList[i]);
										this.exponentList.push(operand1.exponentList[i] * operand2.coefficient);
									}
								}
							}
						}
						else {
							// operand2 contains variable -> error / nothing to calculate
						}
						break;
					case '*':
					case '/':
						if (operation =='*') {
							this.coefficient = operand1.coefficient * operand2.coefficient;
						}
						else {
							this.coefficient = operand1.coefficient / operand2.coefficient;	
						}
						if (this.coefficient!=0) {
							let i1 = 0;
							let i2 = 0;
							while (i1 < operand1.variableList.length && i2 < operand2.variableList.length) {
								// same variable -> add / substract exponents
								if (operand1.variableList[i1] == operand2.variableList[i2]) {
									this.variableList.push(operand1.variableList[i1]);
									if (operation =='*') {
										this.exponentList.push(operand1.exponentList[i1] + operand2.exponentList[i2]);
									}
									else {
										this.exponentList.push(operand1.exponentList[i1] - operand2.exponentList[i2]);
									}
									i1++;
									i2++;
								} 
								// copy variable of operand1
								else if (operand1.variableList[i1] < operand2.variableList[i2]) {
									this.variableList.push(operand1.variableList[i1]);
									this.exponentList.push(operand1.exponentList[i1]);
									i1++;
								}
								// copy variable of operand2
								else {
									this.variableList.push(operand2.variableList[i2]);
									this.exponentList.push(operand2.exponentList[i2]);
									i2++;
								}
							}
							// copy remaining variables of operand1
							if (i2 == operand2.variableList.length) {
								while (i1 < operand1.variableList.length) {
									this.variableList.push(operand1.variableList[i1]);
									this.exponentList.push(operand1.exponentList[i1]);
									i1++;
								}
							}
							// copy remaining variables of operand2
							else {
								while (i2 < operand2.variableList.length) {
									this.variableList.push(operand2.variableList[i2]);
									this.exponentList.push(operand2.exponentList[i2]);
									i2++;	
								}
							}
						}
						break;
					case '+':
					case '-':
						// if operand1 = 0 than result = operand2 for + / -operand2 for -
						if (operand1.coefficient==0) {
							if (operation == '+') {
								this.coefficient = operand2.coefficient;
							}
							else {
								this.coefficient = -operand2.coefficient;
							}
							// copy variables and exponents of operand2 to result
							for (let h = 0; h < operand2.variableList.length; h++) {
								this.variableList.push(operand2.variableList[h]);
								this.exponentList.push(operand2.exponentList[h]);
							}
						}
						// if operand2 = 0 than result = operand1-
						else if (operand2.coefficient==0) {
							this.coefficient = operand1.coefficient;
							// copy variables and exponents of operand1 to result
							for (let h = 0; h < operand1.variableList.length; h++) {
								this.variableList.push(operand1.variableList[h]);
								this.exponentList.push(operand1.exponentList[h]);
							}
						} 
						else {
							let varExEqual = (operand1.variableList.length == operand2.variableList.length);
							// variables and exponents of operand1 and operand2 are the same?
							let i = 0;
							while (i < operand1.variableList.length && varExEqual) {
								varExEqual = (operand1.variableList[i] == operand2.variableList[i] &&
										   operand1.exponentList[i] == operand2.exponentList[i]);
								i++;
							}
							// variables and exponents of operand1 and operand2 are the same => calculate result
							if (varExEqual) {
								if (operation == '+') {
									this.coefficient = operand1.coefficient + operand2.coefficient;
								}
								else {
									this.coefficient = operand1.coefficient - operand2.coefficient;
								}
								// if coefficient!=0 than copy variables and exponents to result
								if (this.coefficient!=0) {
									for (let h = 0; h < operand1.variableList.length; h++) {
										this.variableList.push(operand1.variableList[h]);
										this.exponentList.push(operand1.exponentList[h]);
									}
								}
							}
							else {
							// operands can't be added / subtracted -> set coefficient = null
								this.coefficient = null;
							}
						}
						break;
				}
			}
		}