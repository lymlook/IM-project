function plusReady(c, s) {
  try {
    s = typeof s == "string" ? s : "light";
    plus.navigator.setStatusBarStyle(s);
    c = typeof c == "string" ? c : '#429eff';
    plus.navigator.setStatusBarBackground(c);
  } catch (e) {}
}

if(window.plus){ 
	plusReady();
}else{ 
	document.addEventListener('plusready', plusReady, false); 
}