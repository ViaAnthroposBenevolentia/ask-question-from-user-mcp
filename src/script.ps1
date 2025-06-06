Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Define colors
$backgroundColor = [System.Drawing.ColorTranslator]::FromHtml("#2D2D30")
$foregroundColor = [System.Drawing.ColorTranslator]::FromHtml("#F1F1F1")
$controlBackgroundColor = [System.Drawing.ColorTranslator]::FromHtml("#1E1E1E")

# Create the form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Question (Press Ctrl+Enter to submit)"
$form.Opacity = 0.9
$form.StartPosition = "CenterScreen"
$form.TopMost = $true
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.Padding = New-Object System.Windows.Forms.Padding(10)
$form.BackColor = $backgroundColor

# Create the question with auto-sizing
$question = New-Object System.Windows.Forms.Label
$question.Location = New-Object System.Drawing.Point(10, 20)
$question.MaximumSize = New-Object System.Drawing.Size(470, 0) # Unlimited height
$question.Text = $args[0]
$question.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 11)
$question.ForeColor = $foregroundColor
$question.AutoSize = $true
$question.UseMnemonic = $false 
$form.Controls.Add($question)

# Calculate dynamic positioning based on question height
$textBoxY = $question.Bottom + 20

# Create the text input
$textBox = New-Object System.Windows.Forms.TextBox
$textBox.Location = New-Object System.Drawing.Point(10, $textBoxY)
$textBox.Size = New-Object System.Drawing.Size(470, 100)
$textBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$textBox.BackColor = $controlBackgroundColor
$textBox.ForeColor = $foregroundColor
$textBox.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$textBox.Padding = New-Object System.Windows.Forms.Padding(5)
$textBox.Multiline = $true
$textBox.AcceptsReturn = $true
$textBox.ScrollBars = [System.Windows.Forms.ScrollBars]::None
$textBox.Add_KeyDown({
        param($s, $e)
        if ($e.KeyCode -eq [System.Windows.Forms.Keys]::Enter -and $e.Control) {
            $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
            $e.Handled = $true
            $e.SuppressKeyPress = $true
        }
    })
$form.Controls.Add($textBox)

# Calculate and set form size based on content
$formHeight = $textBox.Bottom + 50
$form.Size = New-Object System.Drawing.Size(505, $formHeight)

# Focus on text box
$textBox.Select()

# Show the dialog
$result = $form.ShowDialog()

if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $textBox.Text
}
else {
    Write-Output ""
} 