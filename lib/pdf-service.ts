import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import type { Project } from "@/lib/project-service"
import type { Chapter } from "@/lib/chapter-service"

// Function to generate and download a PDF for an ebook project
export async function downloadEbookAsPDF(project: Project & { chapters: Chapter[] }) {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set font sizes
    const titleFontSize = 24
    const chapterTitleFontSize = 18
    const bodyFontSize = 12
    const footerFontSize = 10

    // Set margins
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - 2 * margin

    // Add cover image if available
    if (project.cover_image) {
      try {
        // Load the cover image
        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = project.cover_image
        })

        // Calculate dimensions to fit the page while maintaining aspect ratio
        const imgRatio = img.width / img.height
        let imgWidth = pageWidth - 2 * margin
        let imgHeight = imgWidth / imgRatio

        // If image is too tall, scale it down
        if (imgHeight > pageHeight - 4 * margin) {
          imgHeight = pageHeight - 4 * margin
          imgWidth = imgHeight * imgRatio
        }

        // Center the image on the page
        const imgX = (pageWidth - imgWidth) / 2
        const imgY = margin * 2

        // Add the image to the PDF
        doc.addImage(img, "JPEG", imgX, imgY, imgWidth, imgHeight)

        // Add a new page for the title
        doc.addPage()
      } catch (error) {
        console.error("Error adding cover image to PDF:", error)
        // Continue without the cover image
      }
    }

    // Add title page
    doc.setFontSize(titleFontSize)
    doc.setFont("helvetica", "bold")

    // Title - centered
    const titleLines = doc.splitTextToSize(project.title, contentWidth)
    const titleHeight = titleLines.length * (titleFontSize / 2)
    const titleY = pageHeight / 3

    doc.text(titleLines, pageWidth / 2, titleY, { align: "center" })

    // Description if available
    if (project.description) {
      doc.setFontSize(bodyFontSize)
      doc.setFont("helvetica", "normal")

      const descriptionLines = doc.splitTextToSize(project.description, contentWidth)
      const descriptionY = titleY + titleHeight + 20

      doc.text(descriptionLines, pageWidth / 2, descriptionY, { align: "center" })
    }

    // Add footer with date
    doc.setFontSize(footerFontSize)
    doc.setFont("helvetica", "italic")
    const today = new Date().toLocaleDateString()
    doc.text(`Generated on ${today}`, pageWidth / 2, pageHeight - margin, { align: "center" })

    // Add chapters
    if (project.chapters && project.chapters.length > 0) {
      // Sort chapters by order_index
      const sortedChapters = [...project.chapters].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

      for (const chapter of sortedChapters) {
        // Add a new page for each chapter
        doc.addPage()

        // Chapter title
        doc.setFontSize(chapterTitleFontSize)
        doc.setFont("helvetica", "bold")

        const chapterTitleLines = doc.splitTextToSize(chapter.title, contentWidth)
        doc.text(chapterTitleLines, margin, margin + 10)

        // Chapter content
        if (chapter.content) {
          doc.setFontSize(bodyFontSize)
          doc.setFont("helvetica", "normal")

          // Process the content to handle markdown or HTML
          const processedContent = processContentForPDF(chapter.content)
          const contentLines = doc.splitTextToSize(processedContent, contentWidth)

          // Check if content fits on the page, otherwise add new pages
          let currentY = margin + 25
          const lineHeight = bodyFontSize * 0.5

          for (let i = 0; i < contentLines.length; i++) {
            // Check if we need a new page
            if (currentY + lineHeight > pageHeight - margin) {
              doc.addPage()
              currentY = margin + 10
            }

            doc.text(contentLines[i], margin, currentY)
            currentY += lineHeight
          }
        }

        // Add page number
        doc.setFontSize(footerFontSize)
        const pageNumber = doc.internal.getNumberOfPages()
        doc.text(`${pageNumber}`, pageWidth / 2, pageHeight - margin, { align: "center" })
      }
    }

    // Save the PDF
    const filename = `${project.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
    doc.save(filename)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

// Helper function to process content for PDF (strip HTML tags, etc.)
function processContentForPDF(content: string): string {
  if (!content) return ""

  // Create a temporary element to strip HTML tags
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = content

  // Get text content
  let processedContent = tempDiv.textContent || tempDiv.innerText || content

  // Replace markdown syntax
  processedContent = processedContent
    .replace(/#{1,6}\s+/g, "") // Remove headings
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/\[(.*?)\]$$(.*?)$$/g, "$1") // Replace links with just the text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`(.*?)`/g, "$1") // Remove inline code

  return processedContent
}

// Function to export a rendered HTML element to PDF
export async function exportElementToPDF(element: HTMLElement, filename: string): Promise<void> {
  // Create a canvas from the element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true, // Allow loading images from other domains
    logging: false,
  })

  // Create PDF of the same size as the element
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  })

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)

  // Save the PDF
  pdf.save(filename)
}
