import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { downloadCertificate } from '@/lib/certificate'
import { Award, Download } from 'lucide-react'

interface CertificateCardProps {
    studentName: string
    courseName: string
    completionDate: string
}

export function CertificateCard({ studentName, courseName, completionDate }: CertificateCardProps) {
    const handleDownload = () => {
        downloadCertificate(studentName, courseName, completionDate)
    }

    return (
        <Card className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-teal-900">Curso Concluído!</p>
                    <p className="text-xs text-teal-700/80 truncate">{courseName}</p>
                </div>
                <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="outline"
                    className="border-teal-300 text-teal-700 hover:bg-teal-100 gap-1.5 flex-shrink-0"
                >
                    <Download className="h-3.5 w-3.5" />
                    Certificado
                </Button>
            </div>
        </Card>
    )
}
