import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "MealOptimiza™ • Clinical African Metabolic AI Platform Documentation")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY • MEALOPTIMIZA GLOBAL • mealoptimiza.com")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def generate_pdf():
    pdf_filename = "MealOptimiza_Comprehensive_Platform_Documentation.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    TEAL_PRIMARY = colors.HexColor("#126778")
    TEAL_DARK = colors.HexColor("#0b3c47")
    EMERALD_ACCENT = colors.HexColor("#10b981")
    SLATE_DARK = colors.HexColor("#0f172a")
    SLATE_TEXT = colors.HexColor("#334155")
    BG_LIGHT = colors.HexColor("#f8fafc")
    BORDER_COLOR = colors.HexColor("#e2e8f0")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=TEAL_DARK,
        alignment=0,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=TEAL_PRIMARY,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=TEAL_DARK,
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=TEAL_PRIMARY,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=SLATE_TEXT,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=SLATE_TEXT,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=SLATE_TEXT
    )

    story = []

    # =========================================================================
    # COVER & HEADER BLOCK
    # =========================================================================
    story.append(Paragraph("MEALOPTIMIZA™ SYSTEM ARCHITECTURE", ParagraphStyle('SuperTitle', fontName='Helvetica-Bold', fontSize=10, textColor=EMERALD_ACCENT, spaceAfter=4)))
    story.append(Paragraph("Complete Platform Functionalities & Clinical AI Specification", title_style))
    story.append(Paragraph("The World's First Clinical Metabolic AI Nutrition Engine for African & Diaspora Diets", subtitle_style))
    
    # Metadata Card Table
    meta_data = [
        [
            Paragraph("<b>Version:</b> 3.0 (Production Release)", table_cell_style),
            Paragraph("<b>Domain:</b> mealoptimiza.com", table_cell_style),
            Paragraph("<b>Compliance:</b> HIPAA & GDPR Ready", table_cell_style)
        ],
        [
            Paragraph("<b>Security:</b> Supabase Row-Level Security", table_cell_style),
            Paragraph("<b>Architecture:</b> Mobile-First PWA (Vite/React)", table_cell_style),
            Paragraph("<b>Target Reach:</b> 1.5B+ Global Market", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # EXECUTIVE SUMMARY
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & Core Value Proposition", h1_style))
    story.append(Paragraph(
        "<b>MealOptimiza</b> is a specialized, clinical-grade nutrition and metabolic intelligence platform engineered specifically for African and African Diaspora demographics. Mainstream nutrition apps (MyFitnessPal, YAZIO, Noom) consistently fail to model cultural African staples (such as Pounded Yam, Egusi, Fufu, Amala, and Jollof Rice), leading to inaccurate caloric estimates and unmanaged glycemic spikes in populations with 2x-3x higher rates of Type 2 Diabetes and Hypertension.",
        body_style
    ))
    story.append(Paragraph(
        "MealOptimiza solves this global health disparity through proprietary swallow portion biochemistry, glycemic load moderation, multi-modal AI food vision, 2-second WhatsApp logging, and 1-tap physician clinical PDF health reports.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # =========================================================================
    # MODULE 1: MULTI-MODAL LOGGING HUB
    # =========================================================================
    story.append(Paragraph("2. Multi-Modal AI Logging Hub", h1_style))
    story.append(Paragraph("MealOptimiza provides four distinct, frictionless logging modalities to ensure maximum user compliance:", body_style))
    
    logging_features = [
        ("📸 AI Camera Food Vision Scanner", "Users take a single photo of their meal plate. The neural vision classifier identifies African dishes, parses mixed swallows/soups, estimates carbohydrate density, and delivers instant portion advice."),
        ("💬 WhatsApp Conversational AI Food Logger", "Integrates natively with WhatsApp (95%+ smartphone penetration across Africa & Diaspora). Users send photos or voice notes directly to the MealOptimiza verified bot to log meals in 2 seconds."),
        ("🎙️ Voice AI Food Logger (English & Nigerian Pidgin)", "Proprietary natural language processing accurately interprets regional dialect phrases (e.g., 'I chop two wraps of semo and vegetable soup with goat meat')."),
        ("⚡ 1-Tap Quick-Log Shelf & Barcode Scanner", "Pre-indexed library of 500+ authentic African dishes with instantaneous single-tap diary logging and barcode scanning for packaged foods."),
        ("⏱️ Intermittent Fasting & Hydration Wheel", "Live circadian fasting tracker (16:8, 14:10, 18:6) synced with dynamic water intake gauges and post-meal glucose walk reminders.")
    ]
    for title, desc in logging_features:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # MODULE 2: CLINICAL METABOLIC INTELLIGENCE
    # =========================================================================
    story.append(Paragraph("3. Clinical Metabolic Intelligence & Health Passport", h1_style))
    
    clinical_features = [
        ("Dynamic BMI Spectrum Gauge", "Real-time visual spectrum gauge calculating exact BMI (kg/m²), identifying healthy, overweight, and obesity zones with automated dietary calibration."),
        ("Resting Blood Pressure & Cardiovascular Monitor", "Logs Systolic/Diastolic readings with automatic DASH (Dietary Approaches to Stop Hypertension) sodium limit enforcement."),
        ("Post-Meal Glucose Walk Reminders", "Automated timer prompting 15-minute walks exactly 20 minutes post-carbohydrate consumption to blunt glycemic excursions by ~35%."),
        ("Spike Shield Glycemic Alerts", "Instant warnings when meal carbohydrate density exceeds safe limits, offering instant vegetable, fiber, or healthy fat buffer suggestions."),
        ("Continuous Glucose Monitoring (CGM) Simulator", "Predictive postprandial glucose curves based on meal macronutrient distribution and fiber/fat ratios.")
    ]
    for title, desc in clinical_features:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    story.append(Spacer(1, 10))

    # Page Break for clean reading
    story.append(PageBreak())

    # =========================================================================
    # MODULE 3: DOCTOR PDF EXPORT ENGINE
    # =========================================================================
    story.append(Paragraph("4. Physician-Grade Clinical PDF Health Reports", h1_style))
    story.append(Paragraph(
        "Patients can generate comprehensive 30-day clinical PDF summaries with one tap directly from their Profile or Health tab. Designed specifically for medical consultations with endocrinologists, cardiologists, and dietitians:",
        body_style
    ))
    
    report_points = [
        ("Complete 30-Day Vitals Log", "Daily tracking of caloric adherence, macro percentages, and blood pressure averages."),
        ("Glycemic Consistency Index", "Numerical rating (0-100%) tracking how well the patient avoided glycemic spikes."),
        ("Medication & Lifestyle Adherence", "Documented log of fasting compliance, water intake, and exercise sessions."),
        ("Secure & Shareable", "Exported as an encrypted, print-ready document formatted to international clinical standards.")
    ]
    for title, desc in report_points:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # MODULE 4: CULINARY LAB & DIASPORA SWAPS
    # =========================================================================
    story.append(Paragraph("5. Metabolic Culinary Lab & Global Diaspora Swaps", h1_style))
    story.append(Paragraph(
        "MealOptimiza bridges the gap between traditional cultural tastes and international supermarket availability:",
        body_style
    ))

    culinary_table_data = [
        [
            Paragraph("<b>Traditional African Staple</b>", table_header_style),
            Paragraph("<b>Clinical Challenge</b>", table_header_style),
            Paragraph("<b>MealOptimiza Bio-Swap (Local / Diaspora)</b>", table_header_style)
        ],
        [
            Paragraph("Pounded Yam (Iyan)", table_cell_style),
            Paragraph("Very high Glycemic Index (~85)", table_cell_style),
            Paragraph("Oat Flour Swallow, Cauliflower Yam, or Spelt Flour", table_cell_style)
        ],
        [
            Paragraph("High-Sodium Bouillon Cubes", table_cell_style),
            Paragraph("Elevates blood pressure (HTN risk)", table_cell_style),
            Paragraph("Fermented Locust Beans (Iru), Crayfish, Garlic, Ginger & Black Pepper", table_cell_style)
        ],
        [
            Paragraph("White Rice Jollof", table_cell_style),
            Paragraph("Rapid glucose spikes", table_cell_style),
            Paragraph("Ofada Brown Rice, Quinoa Jollof, or Bulgur Wheat Infusion", table_cell_style)
        ],
        [
            Paragraph("Fresh Pumpkin Leaf (Ugu)", table_cell_style),
            Paragraph("Hard to source in UK/US/Canada", table_cell_style),
            Paragraph("Chopped Kale, Baby Spinach, or Collard Greens with Palm Oil balance", table_cell_style)
        ]
    ]

    culinary_table = Table(culinary_table_data, colWidths=[140, 150, 214])
    culinary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(culinary_table)
    story.append(Spacer(1, 12))

    # =========================================================================
    # MODULE 5: TECHNICAL ARCHITECTURE & SECURITY
    # =========================================================================
    story.append(Paragraph("6. Enterprise Security & PWA Technical Architecture", h1_style))
    
    tech_specs = [
        ("Frontend & Mobile PWA", "Vite 6, React 18, Tailwind CSS v4, Framer Motion for 60fps native transitions, and service workers for offline caching."),
        ("Backend & Database", "Supabase PostgreSQL with Row-Level Security (RLS) policies ensuring 100% patient data isolation and HIPAA/GDPR readiness."),
        ("Security Protocols", "Strict-Transport-Security (HSTS 63072000s), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and TLS 1.3 encryption."),
        ("Global Infrastructure", "Vercel Edge Network with sub-50ms latency across North America, Europe, and West Africa.")
    ]
    for title, desc in tech_specs:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    story.append(Spacer(1, 14))

    # =========================================================================
    # OFFICIAL CONTACT & SIGN-OFF
    # =========================================================================
    contact_box = [
        [
            Paragraph(
                "<b>Official Enterprise Inquiries & Support:</b><br/>"
                "• <b>General Information:</b> info@mealoptimiza.com<br/>"
                "• <b>Support & Assistance:</b> contact@mealoptimiza.com<br/>"
                "• <b>Privacy & Governance:</b> privacy@mealoptimiza.com<br/>"
                "• <b>Live Platform:</b> https://mealoptimiza.com",
                table_cell_style
            )
        ]
    ]
    contact_table = Table(contact_box, colWidths=[504])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0fdfa")),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor("#2dd4bf")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(contact_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF successfully created:", os.path.abspath(pdf_filename))

if __name__ == "__main__":
    generate_pdf()
