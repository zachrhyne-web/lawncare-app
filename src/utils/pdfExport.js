import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const exportInvoiceToPDF = async (element, filename = 'invoice.pdf') => {
  if (!element) throw new Error('No element to capture')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const ratio = canvasHeight / canvasWidth
  const imgHeight = pageWidth * ratio

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
  } else {
    // Multi-page support
    let yOffset = 0
    let remaining = canvasHeight
    while (remaining > 0) {
      const sliceHeight = Math.min((pageHeight / pageWidth) * canvasWidth, remaining)
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvasWidth
      sliceCanvas.height = sliceHeight
      const ctx = sliceCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, yOffset, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight)
      const sliceData = sliceCanvas.toDataURL('image/png')
      if (yOffset > 0) pdf.addPage()
      pdf.addImage(sliceData, 'PNG', 0, 0, pageWidth, (sliceHeight / canvasWidth) * pageWidth)
      yOffset += sliceHeight
      remaining -= sliceHeight
    }
  }

  pdf.save(filename)
}
