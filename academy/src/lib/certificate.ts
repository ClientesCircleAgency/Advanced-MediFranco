import { jsPDF } from 'jspdf'

export function generateCertificate(
    studentName: string,
    courseName: string,
    completionDate: string
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()

    // Background
    doc.setFillColor(245, 247, 250)
    doc.rect(0, 0, width, height, 'F')

    // Border frame
    doc.setDrawColor(13, 148, 136) // teal-600
    doc.setLineWidth(2)
    doc.rect(10, 10, width - 20, height - 20)
    doc.setLineWidth(0.5)
    doc.rect(14, 14, width - 28, height - 28)

    // Header decorative line
    doc.setFillColor(13, 148, 136)
    doc.rect(40, 30, width - 80, 1.5, 'F')

    // "CERTIFICADO DE CONCLUSÃO" heading
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(107, 114, 128)
    doc.text('CERTIFICADO DE CONCLUSÃO', width / 2, 45, { align: 'center' })

    // Student name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(32)
    doc.setTextColor(17, 24, 39)
    doc.text(studentName, width / 2, 75, { align: 'center' })

    // "concluiu com sucesso o curso"
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(107, 114, 128)
    doc.text('concluiu com sucesso o curso', width / 2, 92, { align: 'center' })

    // Course name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(13, 148, 136)
    doc.text(courseName, width / 2, 110, { align: 'center' })

    // Date
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(107, 114, 128)
    doc.text(`Concluído a ${completionDate}`, width / 2, 130, { align: 'center' })

    // Bottom decorative line
    doc.setFillColor(13, 148, 136)
    doc.rect(40, height - 45, width - 80, 1.5, 'F')

    // Footer branding
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(13, 148, 136)
    doc.text('MediFranco Academy', width / 2, height - 32, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(156, 163, 175)
    doc.text('Formação Online para Profissionais de Saúde', width / 2, height - 25, { align: 'center' })

    return doc
}

export function downloadCertificate(
    studentName: string,
    courseName: string,
    completionDate: string
) {
    const doc = generateCertificate(studentName, courseName, completionDate)
    const fileName = `certificado-${courseName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    doc.save(fileName)
}
