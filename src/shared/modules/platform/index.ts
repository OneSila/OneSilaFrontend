const userAgentString = navigator.userAgent

export const isChrome = () => {
  return userAgentString.indexOf("Chrome") > -1
}

export const isExplorer = () => {
  return userAgentString.indexOf("MSIE") > -1 || userAgentString.indexOf("rv:") > -1
}

export const isFirefox = () => {
  return userAgentString.indexOf("Firefox") > -1
}

export const isSafari = () => {
  const isSafariAgent = userAgentString.indexOf("Safari") > -1
  
  return isSafariAgent && !isChrome()
}

export const isOpera = () => {
  let isOperaAgent = userAgentString.indexOf("OP") > -1

  return isOperaAgent && !isChrome()
}
