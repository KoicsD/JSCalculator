/**
 * Created by KoicsD on 2016.05.31..
 */
(function (app) {
    window.addEventListener('load', init);  // adds functions as 'click' event-handlers automatically, so you don't have to invoke them from HTML
    app.push = push;  // expects a digit, a decimal dot or an operator as string, adds it to screen and on success, returns it
    app.pushMany = pushMany;  // multiple-character version of the above
    app.eval = eval;  // evaluates expression on screen, writes result on screen and returns it
    app.clear = clear;  // clears screen
    app.infoEnabled = true;  // specifies weather the app has to collect information about numbers

    // To make it clear:
    // 'eval' returns a number
    // 'push('=')' returns the result as string, prefixed by '='
    // 'pushMany' returns the whole statement
    // 'clear' returns nothing

    // firstly, event-handlers
    var keys;
    var topScreen;
    var bottomScreen;

    function init(event) {
        try {
            // selecting keys and top screen:
            topScreen = document.querySelector('#top .screen');  // problems with old browsers
            bottomScreen = document.querySelector('#bottom .screen');
            keys = document.querySelectorAll('.key');

            // adding functions as 'click' event-handlers, so as you don't have to invoke them from HTML:
            Array.prototype.forEach.call(keys, function (currentKey) {
                if (currentKey.classList.contains('clear')) {
                    currentKey.addEventListener('click', function (event) {
                        tryHandleClick(clear);
                    });
                }
                else if (currentKey.classList.contains('eval')) {
                    currentKey.addEventListener('click', function (event) {
                        tryHandleClick(eval);
                    });
                }
                else {
                    currentKey.addEventListener('click', function (event) {
                        tryHandleClick(push, event.target.innerHTML);
                    });
                }
            });
        }
        catch (exc) {
            console.log('Exception while initializing event-handlers:\n' + (exc.stack ? exc.stack : exc.toString()));
            alert(':( Sorry, an exception occurred while initializing javascript code. Calculator won\'t work. See console.');
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
                console.log('Exception in \'click\' event-handler:\n' + (exc.stack ? exc.stack : exc.toString()));
                alert(':( An exception occurred while handling click event. See console.');
            }
        }
    }

    // after event-handlers, real calculator-logic
    var operators = ['+', '-', 'x', '÷'];
    var validator = /^(\-?([0-9]+|([0-9]*\.[0-9]*)|Infinity|NaN)([\+\-\*\/x÷]([0-9]+|([0-9]*\.[0-9]*)|Infinity|NaN))*)?$/;  // regex to quick-text expressions
    // var splitter = /[0-9]|\.|[\+\-\*\/x÷]|=|Infinity|NaN]/g;  // regex to split an expression to its digits
    var decimalAdded = false;

    function push(value) {  // let's enter something into our calculator  -- only one digit at a time
        var strValue = value.toString().replace(/\*/g, 'x').replace(/\//, '÷');  // for compatibility with *, /, and real numeric
        if (topScreen.innerHTML.length > 0)
            var lastChar = topScreen.innerHTML[topScreen.innerHTML.length - 1];
        if (strValue === 'C') {  // 'strValue' is 'C'
            clear();  // redirection to function 'clear'
        }
        else if (strValue === '=') {
            eval();  // redirection to function 'eval'
            return '=' + topScreen.innerHTML;
        }
        else if (operators.indexOf(strValue) > -1) {  // 'strValue' is an operator
            if (!!lastChar && operators.indexOf(lastChar) === -1) {  // only if content is not empty and there is no operator at the end
                topScreen.innerHTML += strValue;  // shall we append
                decimalAdded = false;
                return strValue;
            }
            if (strValue === '-' && topScreen.innerHTML.length === 0) {  // however, 'minus' sign on the beginning of screen
                topScreen.innerHTML += strValue;  // is also possible
                return strValue;
            }
        }
        else if (strValue === '.') {  // 'strValue' is a decimal point
            if (!decimalAdded) {  // only if there is no decimal point in number shall we append
                if (!lastChar || operators.indexOf(lastChar) > -1)  // if content is empty or last char is operator
                    strValue = '0.';  // let's fill gap with zero
                topScreen.innerHTML += strValue;
                decimalAdded = true;
                return strValue;
            }
        }
        else if (!!strValue && strValue.length === 1 && !isNaN(parseInt(strValue))) {  // 'strVal' is a digit
            topScreen.innerHTML += strValue;
            return strValue;
        }
        else if (strValue === 'Infinity' || strValue === 'NaN') {  // because of batch-enter we have to accept such things, as well
            if (!lastChar || operators.indexOf(lastChar) > -1) {  // only at beginning or after an operator
                topScreen.innerHTML += strValue;
                return strValue;
            }
        }
        else {  // someone has invoked it outside calculator, having no idea what this function expects
            throw 'Argument \'value\' of function \'calculator.push\' must be a valid digit, a decimal point or an operator';
        }
        return '';
    }

    function pushMany(exprChain) {  // batched-enter
        var expressions = exprChain.split('=');  // let's split it by '='
        if (!expressions.every(function (expr, ind, arr) {
                if (ind === 0)  // the first expression
                    return validator.test(topScreen.innerHTML + expr);  // must mach prefixed by screen-content
                else  // in case of the rest
                    return validator.test('0.0' + expr);  // we can use 0.0 instead of the real result of the last expression
            }))
            throw 'Parameter \'exprChain\' prefixed with screen-content in function \'calculator.pushMany\' ' +
                'must be an expression-chain with \'=\' as delimiter\n' +
                'Each expression must be numbers separated by operators.\n' +
                'No clear-character (\'C\') allowed.';
        var answer = '';
        expressions.forEach( function (expr, ind, arr) {
            if (ind > 0)
                answer += push('=');
            Array.prototype.forEach.call(expr, function (digit) {
                answer += push(digit);
            });
        });
        return answer;
    }

    function eval() {
        if (topScreen.innerHTML.length === 0)  // if no text is there
            return NaN;  // nothing to do
        var equation = topScreen.innerHTML;
        var lastChar = equation[equation.length - 1];
        if (operators.indexOf(lastChar) > -1 || lastChar === '.')  // if last char is an operator or decimal
            equation = equation.replace(/.$/, '');  // let's remove it
        equation = equation.replace(/x/g, '*').replace(/÷/g, '/');  // all 'x' to * and all '÷' to '/'
        var result;
        try {
            result = window.eval(equation);  // and we can try to evaluate it
            topScreen.innerHTML = result;
            decimalAdded = result !== Math.floor(result);
        }
        catch (exc) {  // for certain security, a catch-block -- easy to debug
            throw 'Exception while evaluating expression (in \'calculator.eval\'):\n' + (exc.stack ? exc.stack : exc.toString());
        }
        if (!!result) {
            if (app.infoEnabled && !isNaN(result) && isFinite(result))
                fetchInfo(result);
            return result;
        }
        return NaN;
    }

    function clear() {
        topScreen.innerHTML = '';
        bottomScreen.innerHTML = '';
        decimalAdded = false;
    }

    // finally, AJAX section
    function fetchInfo(number) {
        if (number === undefined || isNaN(number) || !isFinite(number))
            throw 'Argument \'number\' of function \'calculator.fetchInfo\' must be a real, finite number.';
        var numsToSend = [];
        Array.prototype.push.apply(numsToSend, collectDigits(number));
        if (number === Math.floor(number) && numsToSend.indexOf(number) === -1)
            numsToSend.push(number);
        var request;
        if (window.XMLHttpRequest)
            request = new XMLHttpRequest();
        else if (window.ActiveXObject)
            request = new ActiveXObject('Microsoft.XMLHTTP');
        else {
            app.infoEnabled = false;
            console.log('Unable to detect AJAX-module of browser. Disabling info-mode.');
            alert(':( Info-display has been switched off since Your Browser does not seem to support AJAX.');
            return;
        }
        var url = 'http://numbersapi.com/' + numsToSend.join(',') + '?json';
        request.open('GET', url);
        //request.setRequestHeader('Content-Type', 'application/json');
        request.onreadystatechange = function (event) {
            var data = {};
            if (tryParseData(event.target, data))
                tryDisplayData(data);
        };
        request.send();
        console.log('HTTP-request sent:\nGET ' + url);

        function collectDigits(num) {
            var digits = [];
            for (var i = 0; i < 10; ++i) {
                if (num.toString().indexOf(i.toString()) > -1) {
                    digits.push(i);
                }
            }
            return digits;
        }
        function tryParseData(req, data) {
            if (req.readyState === 4) {
                if (req.status !== 200) {
                    console.log('HTTP-\'GET\'-request failed with status: ' + req.status);
                    return false;
                }
                console.log('HTTP-\'GET\'-request successful.');
                try {
                    Object.assign(data, JSON.parse(req.responseText));
                    return true;
                }
                catch (exc) {
                    console.log('Exception when processing HTTP-response.\n' + (exc.stack ? exc.stack : exc.toString()));
                }
            }
            return false;
        }
        function tryDisplayData(data) {
            bottomScreen.innerHTML = '';
            if (!!data.number && !!data.text) {
                appendParagraph(data.number, data.text);
            }
            else {
                for (var num in data) {
                    if (data.hasOwnProperty(num)) {
                        if (num != data[num].number || !data[num].text) {
                            console.log('Exception when displaying info:\n' +
                                'Property \'number\' and \'text\' cannot be found in response object.');
                            break;
                        }
                        appendParagraph(data[num].number, data[num].text);
                    }
                }
            }

            function appendParagraph(num, txt) {
                var title = document.createElement('h6');
                var paragraph = document.createElement('p');
                title.innerHTML = num + ':';
                paragraph.innerHTML = txt;
                bottomScreen.appendChild(title);
                bottomScreen.appendChild(paragraph);
            }
        }
    }

})(window.calculator = window.calculator || {});