ObjC.import('AppKit');

function run(argv) {
  var res = {};
  getWebLink(res);

  if (res.hasOwnProperty('title') && res.hasOwnProperty('url')) {
    copyToClipboard(res);
    pasteFromClipboard();

    return res.title + ' - ' + res.url;
  }

  return 'Failed!';
}

function getWebLink(res) {
  var browsers = [
    'Orion',
    'Safari',
    'Vivaldi',
    'Brave Browser',
    'Google Chrome'
  ];
  var strBrowser = '';
  for (var i = 0; i < browsers.length; i++) {
    if (Application(browsers[i]).running()) {
      strBrowser = browsers[i];
      break;
    }
  }
  if (strBrowser === '') {
    return false;
  }

  if (['Orion', 'Safari'].includes(strBrowser)) {
    var tab = Application(strBrowser).windows[0].currentTab;
    res.url = tab.url();
    res.title = tab.name();
  }
  else if (['Vivaldi', 'Brave Browser', 'Google Chrome'].includes(strBrowser)) {
    res.title = applyJsCode(
      function () {
        return document.title;
      },
      strBrowser
    );
    res.url = applyJsCode(
      function () {
        return document.URL;
      },
      strBrowser
    );
  }
  else {
    return false;
  }

  return true;
}

function applyJsCode(fn, strBrowser) {
  var browser = Application(strBrowser);
  var jsCode = '(' + fn.toString() + ').apply(null);';
  var res = '';
  if (strBrowser === 'Safari') {
    res = browser.doJavaScript(
      jsCode, {
        "in": browser.windows[0].tabs[0]
      }
    );
  }
  else {
    res = browser.windows[0].activeTab.execute({
        "javascript": jsCode
      });
  }

  return res;
}

function copyToClipboard(res) {
  var pb = $.NSPasteboard.generalPasteboard;
  var str1 = $.NSString.alloc.initWithUTF8String('<a href="' + res.url + '">' + res.title +'</a>');
  var str2 = $.NSString.alloc.initWithUTF8String('[' + res.title + '](' + res.url + ')');
  var str3 = $.NSString.alloc.initWithUTF8String('{\\rtf1\\ansi\deff0{\\field{\\*\\fldinst{HYPERLINK "' + res.url + '"}}{\\fldrslt ' + res.title + '}}}');

  pb.clearContents;
  pb.setStringForType(str1, $.NSPasteboardTypeHTML);
  pb.setStringForType(str2, $.NSPasteboardTypeString);
  pb.setStringForType(str3, $.NSPasteboardTypeRTF);
}

function pasteFromClipboard() {
  var se = Application('System Events');
  se.keystroke('v', { using: 'command down' });
}
