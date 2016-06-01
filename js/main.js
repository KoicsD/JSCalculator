/**
 * Created by KoicsD on 2016.05.31..
 */
(function (app) {
    window.addEventListener('load', init);  // adds functions as 'click' event-handlers automatically, so you don't have to invoke them from HTML
    app.push = push;  // expects a digit, a decimal dot or an operator as string, adds it to screen and on success, returns it
    app.pushMany = pushMany;  // multiple-character version of the above
    app.eval = eval;  // evaluates expression on screen, writes result on screen and returns it
    app.clear = clear;  // clears screen

    // To make it clear:
    // 'eval' returns a number
    // 'push('=')' returns the result as string, prefixed by '='
    // 'pushMany' returns the whole statement
    // 'clear' returns nothing

    // firstly, event-handlers
    function init(event) {
        // selecting keys and top screen:
        screen = document.querySelector('#top .screen');  // problems with old browsers
        keys = document.querySelectorAll('.key');
        window.bla = keys;

        // adding functions as 'click' event-handlers, so as you don't have to invoke them from HTML:
        Array.prototype.forEach.call(keys, function (currentKey) {
            if (currentKey.classList.contains('clear')) {
                currentKey.addEventListener('click', function (event) { tryHandleClick(clear); });
            }
            else if (currentKey.classList.contains('eval')) {
                currentKey.addEventListener('click', function (event) { tryHandleClick(eval); });
            }
            else {
                currentKey.addEventListener('click', function (event) { tryHandleClick(push, event.target.innerHTML); });
            }
        });
    }

    function tryHandleClick() {  // better to alert user on click-handler exception
        try {
            if (arguments.length === 1) {
                arguments[0]();
            }
            else if (arguments.length > 1) {
                arguments[0](arguments[1]);
            }
        }
        catch (exc) {
            console.log('Exception in \'click\' event-handler:\n' + exc.toString());
            alert(':( An exception occurred while handling click event. See console.');
        }
    }

    // after event-handlers, real calculator-logic
    var keys;
    var screen;
    var operators = ['+', '-', 'x', '÷'];
    var regex = /^(\-?([0-9]+|([0-9]+\.[0-9]*)|([0-9]*\.[0-9]+))([\+\-\*\/x÷]([0-9]+|([0-9]+\.[0-9]*)|([0-9]*\.[0-9]+)))*)?$/;  // regex to quick-text expressions
    var decimalAdded = false;

    function push(value) {  // let's enter something into our calculator
        var strValue = value.toString().replace(/\*/g, 'x').replace(/\//, '÷');  // for compatibility with *, /, and real numeric
        if (screen.innerHTML.length > 0)
            var lastChar = screen.innerHTML[screen.innerHTML.length - 1];
        if (strValue === 'C') {  // 'strValue' is 'C'
            clear();  // redirection to function 'clear'
        }
        else if (strValue === '=') {
            eval();  // redirection to function 'eval'
            return '=' + screen.innerHTML;
        }
        else if (operators.indexOf(strValue) > -1) {  // 'strValue' is an operator
            if (!lastChar || operators.indexOf(lastChar) === -1) {  // only if there is no operator at the end
                screen.innerHTML += strValue;  // shall we append
                decimalAdded = false;
                return strValue;
            }
            if (strValue === '-' && screen.innerHTML.length === 0) {  // however, 'minus' sign on the beginning of screen
                screen.innerHTML += strValue;  // is also possible
                return strValue;
            }
        }
        else if (strValue === '.') {  // 'strValue' is a decimal point
            if (!decimalAdded) {  // only if there is no decimal point in number
                screen.innerHTML += strValue;  // shall we append
                decimalAdded = true;
                return strValue;
            }
        }
        else if (!!strValue && strValue.length === 1 && !isNaN(parseInt(strValue))) {  // 'strVal' is a digit
            screen.innerHTML += strValue;
            return strValue;
        }
        else {  // someone has invoked it outside calculator, having no idea what this function expects
            throw 'Argument \'value\' of function \'calculator.push\' must be a valid digit, a decimal point or an operator';
        }
        return '';
    }

    function pushMany(expr) {  // batched-enter
        var checkedExpr = screen.innerHTML + expr.toString();
        if (!checkedExpr.split('=').every(function (elem, ind, arr) {  // let's split it by '='
                if (ind === 0)  // the first expression
                    return regex.test(elem);  // must mach prefixed by screen-content
                else  // in case of the rest
                    return regex.test('0.0' + elem);  // we can use 0.0 instead of the real result of the last expression
            }))
            throw 'Parameter \'expr\' prefixed with screen-content in function \'calculator.pushMany\' ' +
                'must be numbers separated by operators\n' +
                'You can also use expression-chain with \'=\' as delimiter';
        clear();
        var answer = '';
        Array.prototype.forEach.call(checkedExpr, function (currentExpr) {
            answer += push(currentExpr);
        });
        return answer;
    }

    function eval() {
        if (screen.innerHTML.length === 0)  // if no text is there
            return '';  // nothing to do
        var equation = screen.innerHTML.replace(/x/g, '*').replace(/÷/g, '/');  // all 'x' to * and all '÷' to '/'
        var lastChar = equation[equation.length - 1];
        if (operators.indexOf(lastChar) > -1 || lastChar === '.')  // if last char is an operator or decimal
            equation = equation.replace(/.$/, '');  // let's remove it
        try {
            var result = window.eval(equation);  // and we can try to evaluate it
            screen.innerHTML = result;
            decimalAdded = result !== Math.floor(result);
            return result;
        }
        catch (exc) {  // for certain security, a catch-block -- easy to debug
            throw 'Exception while evaluating expression (in \'calculator.eval\'):\n' + exc.toString();
        }
    }

    function clear() {
        screen.innerHTML = '';
        decimalAdded = false;
    }
})(window.calculator = window.calculator || {});