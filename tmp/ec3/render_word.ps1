$ErrorActionPreference = 'Stop'
$docPath = 'C:\Users\ALIENWARE\Documents\GitHub\PetGuard-PI\output\docs\PetGuard_Informe_EC3.docx'
$pdfPath = 'C:\Users\ALIENWARE\Documents\GitHub\PetGuard-PI\tmp\ec3\review.pdf'
$wordApp = New-Object -ComObject Word.Application
$wordApp.Visible = $false
$wordApp.DisplayAlerts = 0
try {
 $report = $wordApp.Documents.Open($docPath, $false, $true)
 $report.Repaginate()
 $report.ExportAsFixedFormat($pdfPath, 17)
 $report.Close(0)
 Write-Output $pdfPath
} finally {
 $wordApp.Quit()
 [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wordApp) | Out-Null
}
