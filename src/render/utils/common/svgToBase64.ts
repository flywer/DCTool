// svg表现标签转base64编码字符串
export const svgToBase64 = (svgElement: SVGElement): string => {
    const svgString = new XMLSerializer().serializeToString(svgElement);
    return 'data:image/svg+xml;base64,' + btoa(decodeURIComponent(encodeURIComponent(svgString)))
}

export const svgStringToBase64 = (svgString: string): string => {
    return 'data:image/svg+xml;base64,' + btoa(decodeURIComponent(encodeURIComponent(svgString)))
}
