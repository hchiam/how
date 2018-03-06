// Reading the code?
// Good starting points: transpile() and parseLine(line)

let isNotChrome = !window.chrome || !window.chrome.webstore;
if (isNotChrome) alert("For best results, use Chrome.");

let tmr_transpile;
let i = document.getElementById('i');
let o = document.getElementById('o');
let lineNumbers = document.getElementById('lineNumbers');
let b = document.getElementById('b');
let tti_output = document.getElementById('thingsToImplement');
let tti = {};
let tti_example = {};

function test() {
  i.value = "get x decreased by y\nhow is x decreased by y?\nlet a equal 1\nget x minus y\ndone\nx from y and u from v\nget x decreased by y of z\nx printed\n'x' printed\n'hi test' printed x\nx printed 'hi test'\n'hi test 1' with x printed 'test 2' with x\nwhat does the fox say\nx printed x printed\n";
  let expected = 'decrease(x,y)<br>function decrease(x,y) {<br>    let a = 1<br>    return x - y<br>}<br>y.x and v.u<br>decrease(x,z.y)<br>alert(x)<br>alert("x")<br>print("hi test",x)<br>print(x,"hi test")<br>print("hi test 1",x,"test 2",x)<br>alert("Ring-ding-ding-ding-dingeringeding!")<br>alert(print(x,x))<br>';
  transpile();
  if (o.innerHTML === expected) {
    alert(':D Test passed! Yay!');
  } else {
    alert('Under construction: Test did not completely pass.');
    findFailedLine(expected,o.innerHTML);
  }
}

function findFailedLine(expected, output) {
  let itest = expected.split('<br>');
  let otest = output.split('<br>');
  itest.forEach(function(e,index){
    if (otest[index] !== itest[index]) {
      alert('Error on line ' + (index+1) + ':\n\n"' + otest[index] + '"\n\n  ...does not equal...\n\n"' + itest[index] + '"');
    }
  });
}

function triggerTranspile() {
  clearTimeout(tmr_transpile);
  tmr_transpile = setTimeout(function(){
    transpile();
  },100);
}

function transpile() {
  let howcode = i.value;
  let c = howcode;
  let l = c.split('\n');
  let len = l.length;
  tti = {};
  l = l.map(parseLine);
  l = formatIndents(l);
  createLineNumbers(len);
  o.innerHTML = l.join('<br>');
  formatInput(len);
  formatOutput();
  if (o.innerHTML !== '') {
    b.style.backgroundColor = 'yellow';
  } else {
    b.style.backgroundColor = 'white';
  }
}

function formatIndents(c) {
  let len = c.length;
  let tabs = 0;
  for (let index=0; index<len; index++) {
    if (c[index].slice(-1) === '{') {
      c[index] = Array(tabs+1).join('    ') + c[index];
      tabs += 1;
    } else if (c[index].slice(-1) === '}') {
      tabs -= 1;
      c[index] = Array(tabs+1).join('    ') + c[index];
    } else {
      c[index] = Array(tabs+1).join('    ') + c[index];
    }
  }
  return c;
}

function createLineNumbers(len) {
  lineNumbers.innerHTML = '';
  for (let i=1; i<=len; i++) {
    lineNumbers.innerHTML += i + '<br>';
  }
}

function formatInput(len) {
  i.rows = len+2;
  let c = i.value.split('\n');
  let tabs = 0;
  for (let index=0; index<len; index++) {
    let line = c[index].replace(/^\s\s*/g, '');
    if (line.startsWith('how ')) {
      c[index] = Array(tabs+1).join('    ') + line;
      tabs += 1;
    } else if (line === 'done') {
      tabs -= 1;
      c[index] = Array(tabs+1).join('    ') + line;
    } else {
      c[index] = Array(tabs+1).join('    ') + line;
    }
  }
  i.value = c.join('\n');
}

function formatOutput() {
  if (o.innerHTML !== '') {
    o.style.padding = '10px';
    lineNumbers.style.padding = '10px';
    tti_output.style.padding = '10px';
  } else {
    o.style.padding = '0px';
    lineNumbers.style.padding = '0px';
    lineNumbers.innerHTML = '';
    tti_output.style.padding = '0px';
    tti_output.innerHTML = '';
  }
}

function parseLine(line) {
  line = parseQuote(line);
  line = parseOperators(line);
  line = parseProperties(line);
  line = parseFunction(line);
  line = parseLoop(line);
  line = parsePrint(line);
  line = parseGet(line);
  line = parseDone(line);
  line = cleanupQuotes(line);
  line = parseComment(line);
  line = parseWhatTheFoxSays(line);
  return line;
}

function parseFunction(c) {
  let cd = c.replace('?','');
  let m = window.nlp(cd).match('^how is #Noun? #Adverb? #PastTense #Preposition? #Noun?$');
  if (m.found) {
    let t = m.out('text');
    let f = window.nlp(window.nlp(t).match('#Adverb? #PastTense').verbs().toInfinitive().out('normal')).toCamelCase().out(); // toTitleCase().out();
    f = f[0].toLowerCase() + f.slice(1);
    addToListOfThingsToImplement(f, t);
    let x = window.nlp(t).match('#Noun+').out('array');
    cd = cd.replace(t, 'function ' + f + '(' + x + ') {');
    cd = cd.replace(/`/g,'"').replace(/&nbsp;/g,' ');
    return cd;
  } else {
    return parseFunctionInline(c);
  }
}

function parseFunctionInline(c) {
  let m = window.nlp(c).match('.+ #PastTense .+?');
  if (m.found) {
    let t = m.out('text');
    let fs = window.nlp(window.nlp(t).verbs().toInfinitive().out('normal')).out('text').split(' ').reverse();
    // alert(fs)
    // alert(fs[0])
    // alert(fs[1])
    // f = f[0].toLowerCase() + f.slice(1);
    fs.forEach(function(f){
      let example = window.nlp(t).match('#Noun #Adverb+? #PastTense #Preposition? #Noun?').out('normal');
      checkFunctionIsDefined(f, example);
      let get = window.nlp(t).match('get').found;
      if (!get) f = ' ' + f;
      let x = window.nlp(t).match('#Noun+').out('array');
      c = c.replace(t, f + '(' + x + ')').replace('get ','');
      c = c.replace(/`/g,'"').replace(/&nbsp;/g,' ');
    });
  }
  return c;
}

function generateFunctionDefinitions() {
  let c_extras = '';
  Object.keys(tti).forEach(function(key,index) {
    if (tti[key] === true && !window.nlp(i.value).match('how is #Noun+ ' + tti_example[key] + ' #Noun?+ \n').found) {
      // if (tti[key] === true && !window.nlp(c_original).match('how is #Noun+ ' + tti_example[key] + ' #Noun?+ /\s/').found) {
      c_extras += '\nhow is ' + tti_example[key] + '?\n\ndone\n';
      checkFunctionIsDefined(key, tti_example[key]);
    }
  });
  // i.value = c_extras + c_original;
  i.value += c_extras;
}

function addToListOfThingsToImplement(f, e) {
  tti[f] = false;
  tti_example[f] = e;
  updateListOfThingsToImplement(tti);
}

function checkFunctionIsDefined(f, e) {
  if (f === 'multiply' || f === 'divide') return;
  if (f in tti) {
    tti[f] = false;
  } else {
    tti[f] = true;
  }
  tti_example[f] = e;
  if (f === 'print') return;
  updateListOfThingsToImplement(tti);
}

function updateListOfThingsToImplement(tti) {
  if (tti_output.innerHTML === 'Things to implement:<br>') {
    tti_output.innerHTML = '';
    return;
  }
  tti_output.innerHTML = 'Things to implement:<br>';
  tti_output.innerHTML += Object.keys(tti).map(
    function(key) {
      if (tti[key]) {
        // let fName = window.nlp(key).verbs().toPastTense().out();
        return '<button onclick="stubFunction(\'' + tti_example[key] + '\')">' + tti_example[key] + '</button><br>';
      }
    }
  );
}

function stubFunction(f) {
  i.value += '\nhow is ' + f + '?\n\ndone\n';
  transpile();
}

function parseGet(c) {
  return c.replace('get ', 'return ');
}

function parseDone(c) {
  let m = window.nlp(c).match('^done$');
  if (m.found) return c.replace(m.out(),'}');
  return c;
}

function parseLoop(c) {
  let m = window.nlp(c).match('loop through [.+]');
  if (m.found) {
    return m.out() + '.forEach(function(item,index){})';
  }
  return c;
}

function parseOperators(c) {
  return c
    .replace(/ equals? /g, ' = ')
    .replace(/ not /g, ' !')
    .replace(/ plus/g, ' +')
    .replace(/ minus/g, ' -')
    .replace(/ subtract /g, ' - ')
    .replace(/ multiplied by /g, ' * ')
    .replace(/ divided by /g, ' / ')
    .replace(/ modulo /g, ' % ');
}

function parseProperties(c) {
  // example: x from y and w from e
  let m = window.nlp(c).match('#Noun (from|of) #Noun');
  if (m.found) {
    let ma = m.out('array');
    let r = ma;
    r = r.map(function(e){
      let x = window.nlp(e).match('#Noun+').out('array');
      return x.reverse().join('.');
    });
    r.forEach(function(e,index){
      c = c.replace(ma[index],e);
    });
  }
  // example: x's y
  m = window.nlp(c).match("#Possessive #Noun");
  if (m.found) {
    let ma = m.out('array');
    let r = ma;
    r = r.map(function(e){
      let x = window.nlp(e).match('.').out('array');
      return x.join('.').replace("'s",'');
    });
    r.forEach(function(e,index){
      c = c.replace(ma[index],e);
    });
  }
  return c;
}

function parseQuote(c) {
  let m = c.match(/["'](.+?)["']/g);
  if (m) {
    m.forEach(function(e){
      c = c.replace(e, e.replace(/ /g,'&nbsp;').replace(/'/g,'`').replace(/"/g,'`'));
    });
  }
  return c;
}

function parsePrint(c) {
  if (/print.+,.+/.test(c)) return c;
  return c.replace('print','alert');
}

function cleanupQuotes(c) {
  return c.replace(/`/g,'"').replace(/&nbsp;/g,' ').trim();
}

function parseComment(c) {
  let replaceWith = "// REPHRASE YOUR CODE SO YOU DON'T NEED TO COMMENT";
  let isCompatible = typeof c.startsWith === 'function';
  if (isCompatible) {
    if (c.startsWith('comment ')) return replaceWith;
    if (c.startsWith('//')) return replaceWith;
  } else {
    let lenToMatch = 'comment '.length;
    if (c.substring(0, lenToMatch) === 'comment ') return replaceWith;
    if (c.substring(0, 2) === '//') return replaceWith;
  }
  return c;
}

function parseWhatTheFoxSays(c) {
  if (c.match(/what does the fox say\??/)) {
    return 'alert("Ring-ding-ding-ding-dingeringeding!")';
  }
  return c;
}


// -------------------------------------

function toggleShowSourceFetch() {
  if (document.getElementById('sourceFetch').style.visibility == 'visible') {
    document.getElementById('sourceFetch').style.visibility = 'hidden';
    $('.copyBtn').hide();
    $('#snippet').hide();
    $('#language').hide();
  } else {
    document.getElementById('sourceFetch').style.visibility = 'visible';
  }
}

// sourcefetch code:

let tmr_fetch;
let tries = 0;
let serverUrlStart = "https://sourcefetch-server.glitch.me/fetch";
let code = '';
let spd = 50;

$('.copyBtn').hide(spd);
$('#snippet').hide(spd);
$('#language').hide(spd);

function triggerFetch() {
  clearTimeout(tmr_fetch);
  $('#code').text('...');
  $('#language').css('visibility','visible');
  $('#language').show(spd);
  $('#feedback').css('visibility','visible');
  $('#feedback').show(spd);
  tmr_fetch = setTimeout(function(){
    fetch();
  }, 1000);
}

function userWantsAnswerNow(event, kd) {
  if (event.keyCode == 13) { // key code for "enter"
    clearTimeout(tmr_fetch);
    fetch();
  }
}

function fetch() {
  $('.copyBtn').hide(spd);
  $('#snippet').hide(spd);
  let words = $("#words").val();
  if (words === '') return;
  let lang = $('#language').val();
  let url = serverUrlStart + '/?' + 'q=' + words + '&lang=' + lang;
  msgWaitForAPIServer();
  $.getJSON(url, function(response) {
    if (response.code) {
      // document.getElementById("snippet").innerHTML = response.code;
      clearCodeSnippet();
      replaceNewLines(response.code);
      $('#wait').text('');
      $('.copyBtn').css('visibility','visible');
      $('#snippet').css('visibility','visible');
      $('.copyBtn').show(spd);
      $('#snippet').show(spd);
    } else {
      msgNoSnippetFound();
    }
  });
}

function replaceNewLines(codeString) {
  code = codeString;
  let splitCode = codeString.split('\n');
  let newElem;
  let newText;
  let addTo = document.getElementById("snippet");
  // loop through lines of code
  splitCode.forEach(function(line) {
    newElem = document.createElement("p");
    newText = document.createTextNode(line);
    newElem.appendChild(newText);
    addTo.appendChild(newElem);
  });
}

function clearCodeSnippet() {
  code = '';
  var myNode = document.getElementById("snippet");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

function copyCodeToClipboard() {
  try {
    // create temp input element
    var $temp = $("<input>");
    $("body").append($temp);
    // put value of desired text into temp input element, and select the input
    $temp.val($('#snippet').text()).select();
    // copy the value
    document.execCommand("copy");
    // remove that temp input element
    $temp.remove();
  } catch (err) {
    // otherwise try to save code to a file
    saveCode();
  }
}

function saveCode() {
  try {
    var searchString = cleanupString($("#words").val());
    var filename = searchString + ".txt";
    var temporaryElem = document.createElement("a");
    temporaryElem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(code));
    temporaryElem.setAttribute("download", filename);
    if (document.createEvent) {
      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      temporaryElem.dispatchEvent(event);
    }
    else {
      temporaryElem.click();
    }
  } catch(err) {
    // if the previous code returns an error or isn't supported, try using this instead:
    var content = fullOutputString;
    window.open('data:text/txt;charset=utf-8,' + escape(content), 'newdoc');
  }
}

function cleanupString(name) {
  return name
    .replace(' ','_')
    .replace(/[.,;:'"\/\\<>?!]/g, '');
}

function msgWaitForAPIServer() {
  let choice = getRandomInt(1,3);
  let msg = '';
  switch(choice) {
    case 1:
      msg = 'The API server awakens...';
      break;
    case 2:
      msg = 'Firing up the API server...';
      break;
    default:
      msg = 'Please wait while I wake up the API server...';
  }
  $('#wait').text(msg);
}

function msgNoSnippetFound() {
  let choice = getRandomInt(1,2);
  let msg = '';
  switch(choice) {
    case 1:
      msg = "Sorry, nothing found.";
      break;
    case 2:
      msg = "Sorry, no result found.";
      break;
    default:
      msg = "Sorry, I couldn't find an example code snippet for that.";
  }
  $('#wait').text(msg);
}

function getRandomInt(min, max) { // inclusive min/max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -------------------------------------
