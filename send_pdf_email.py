import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

def send_email_with_pdf(sender_email, app_password, recipient_email):
    pdf_filename = "MealOptimiza_Comprehensive_Platform_Documentation.pdf"
    
    if not os.path.exists(pdf_filename):
        print(f"Error: {pdf_filename} not found!")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = f"MealOptimiza Team <{sender_email}>"
    msg['To'] = recipient_email
    msg['Subject'] = "📄 MealOptimiza™ — Complete Platform Documentation & Clinical AI Specification"

    body = """
Hello,

Please find attached the official, clinical-grade Platform Documentation and Feature Specification for MealOptimiza™ (v3.0).

Document Highlights:
• Executive Summary & 1.5B African/Diaspora Market Scope
• Multi-Modal AI Logging Hub (AI Camera Vision, WhatsApp Bot, Voice Logger in Pidgin/English)
• Clinical Metabolic Intelligence (BMI Spectrum Gauge, Blood Pressure Monitor, Spike Shield)
• Physician-Grade Clinical PDF Health Reports
• Metabolic Culinary Lab & Global Diaspora Supermarket Swaps (Tesco, Walmart, Carrefour)
• Enterprise Security (Supabase HIPAA/GDPR RLS, HSTS, TLS 1.3)

Official Contacts:
• General: info@mealoptimiza.com
• Support: contact@mealoptimiza.com
• Privacy: privacy@mealoptimiza.com
• Website: https://mealoptimiza.com

Best regards,
The MealOptimiza Engineering & Clinical Team
"""
    msg.attach(MIMEText(body, 'plain'))

    # Attach PDF
    with open(pdf_filename, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())

    encoders.encode_base64(part)
    part.add_header(
        "Content-Disposition",
        f"attachment; filename= {pdf_filename}",
    )
    msg.attach(part)

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        text = msg.as_string()
        server.sendmail(sender_email, recipient_email, text)
        server.quit()
        print(f"✅ Successfully sent PDF to {recipient_email}!")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        sender = sys.argv[1]
        pwd = sys.argv[2]
        recipient = sys.argv[3]
        send_email_with_pdf(sender, pwd, recipient)
    else:
        print("Usage: python send_pdf_email.py <your_gmail> <16_char_app_password> <recipient_email>")
