"""
RR Golf — Session 1 Plan
Rendered from a structured data dict produced by the Golfer Profile Interpreter.

Usage:
    from session1_plan_template import build_pdf
    build_pdf('/tmp/out.pdf', data)   # data is the analysis.json payload

For standalone testing, running the module with no data uses the sample payload
in scripts/pdf/_sample_data.py.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, KeepTogether, Flowable)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ── Brand colours ──────────────────────────────────────────────────────────
NAVY      = colors.HexColor('#0A1628')
NAVY_MID  = colors.HexColor('#1A2E4A')
NAVY_LIGHT= colors.HexColor('#2C4A6E')
GOLD      = colors.HexColor('#C9A84C')
WHITE     = colors.white
LIGHT_BG  = colors.HexColor('#F7F8FA')
MID_GREY  = colors.HexColor('#8A9BB0')
DARK_TEXT = colors.HexColor('#1A1A2E')
RULE      = colors.HexColor('#DDE3EC')

HIGH_RISK_COLOR = colors.HexColor('#C0392B')
MANAGEABLE_COLOR = colors.HexColor('#27AE60')


def styles():
    return {
        'doc_title': ParagraphStyle('doc_title', fontName='Helvetica-Bold', fontSize=22, leading=26,
            textColor=NAVY, spaceAfter=2),
        'doc_subtitle': ParagraphStyle('doc_subtitle', fontName='Helvetica', fontSize=11, leading=14,
            textColor=MID_GREY, spaceAfter=4),
        'meta': ParagraphStyle('meta', fontName='Helvetica', fontSize=9, leading=12, textColor=MID_GREY),
        'section_label': ParagraphStyle('section_label', fontName='Helvetica-Bold', fontSize=7, leading=10,
            textColor=GOLD, spaceBefore=16, spaceAfter=4, charSpace=1.5),
        'section_title': ParagraphStyle('section_title', fontName='Helvetica-Bold', fontSize=13, leading=16,
            textColor=NAVY, spaceAfter=6),
        'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=14,
            textColor=DARK_TEXT, spaceAfter=6),
        'body_bold': ParagraphStyle('body_bold', fontName='Helvetica-Bold', fontSize=9.5, leading=14,
            textColor=DARK_TEXT, spaceAfter=4),
        'priority_num': ParagraphStyle('priority_num', fontName='Helvetica-Bold', fontSize=18, leading=20,
            textColor=GOLD, alignment=TA_CENTER),
        'priority_title': ParagraphStyle('priority_title', fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=NAVY),
        'priority_body': ParagraphStyle('priority_body', fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=DARK_TEXT),
        'tiger_title': ParagraphStyle('tiger_title', fontName='Helvetica-Bold', fontSize=9, leading=11,
            textColor=NAVY),
        'tiger_body': ParagraphStyle('tiger_body', fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=DARK_TEXT),
    }


def gold_rule():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=2)


def light_rule():
    return HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=6, spaceBefore=6)


def on_page(canvas, doc):
    W, H = letter
    margin = 0.65 * inch
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, H - 0.55*inch, W, 0.55*inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(margin, H - 0.34*inch, 'RR GOLF')
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MID_GREY)
    canvas.drawRightString(W - margin, H - 0.34*inch, 'madriverpro.com')
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.5)
    canvas.line(0, H - 0.55*inch, W, H - 0.55*inch)
    canvas.setFillColor(RULE)
    canvas.rect(0, 0, W, 0.45*inch, fill=1, stroke=0)
    canvas.setFillColor(MID_GREY)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawCentredString(W/2, 0.17*inch,
        f'Ryan Rinneard · Director of Instruction · Mad River Golf Club · Page {doc.page}')
    canvas.restoreState()


def _student(data):
    s = (data or {}).get('student', {}) or {}
    return {
        'name':        s.get('name') or 'Player',
        'first_name':  s.get('first_name') or (s.get('name') or 'Player').split()[0],
        'handicap':    s.get('handicap') or '—',
        'goal':        s.get('goal') or '—',
        'experience':  s.get('experience') or '—',
    }


def build_pdf(output_path, data=None):
    if data is None:
        from _sample_data import SAMPLE_DATA
        data = SAMPLE_DATA

    S = styles()
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.85*inch, bottomMargin=0.65*inch,
    )
    story = []
    W = 7.2 * inch
    student = _student(data)
    date_label = data.get('date_label') or ''

    # TITLE
    story.append(Spacer(1, 6))
    title_data = [[
        Paragraph('Session 1 — Coaching Plan', S['doc_title']),
        Paragraph(date_label, S['meta'])
    ]]
    title_table = Table(title_data, colWidths=[5.2*inch, 2*inch])
    title_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(title_table)
    story.append(gold_rule())

    # Player meta
    meta_data = [[
        Paragraph(f"<b>{student['first_name']}</b>",
            ParagraphStyle('mn', fontName='Helvetica-Bold', fontSize=11, textColor=NAVY)),
        Paragraph(f"Handicap: <b>{student['handicap']}</b>",
            ParagraphStyle('mm', fontName='Helvetica', fontSize=9, textColor=DARK_TEXT)),
        Paragraph(f"Goal: <b>{student['goal']}</b>",
            ParagraphStyle('mm', fontName='Helvetica', fontSize=9, textColor=DARK_TEXT)),
        Paragraph(f"Experience: <b>{student['experience']}</b>",
            ParagraphStyle('mm', fontName='Helvetica', fontSize=9, textColor=DARK_TEXT)),
        Paragraph('Coach: <b>Ryan Rinneard</b>',
            ParagraphStyle('mm', fontName='Helvetica', fontSize=9, textColor=DARK_TEXT, alignment=TA_RIGHT)),
    ]]
    meta_table = Table(meta_data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1.4*inch, 1.9*inch])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (0,-1), 10),
        ('RIGHTPADDING', (-1,0), (-1,-1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # PLAYER SNAPSHOT
    story.append(Paragraph('PLAYER SNAPSHOT', S['section_label']))
    story.append(Paragraph(f"Who Is {student['first_name']}?", S['section_title']))
    story.append(Paragraph(data.get('snapshot') or '(No snapshot available.)', S['body']))
    story.append(light_rule())

    # PRIORITY ORDER
    priorities = data.get('priorities') or []
    if priorities:
        story.append(Paragraph('PRIORITY ORDER', S['section_label']))
        story.append(Paragraph('Where Your Strokes Are', S['section_title']))
        story.append(Paragraph(
            "Based on your profile, here's where the scoring opportunity lives — ranked by impact.",
            S['body']))
        story.append(Spacer(1, 6))

        pri_rows, row = [], []
        for i, p in enumerate(priorities):
            cell = Table([
                [Paragraph(str(i + 1), S['priority_num'])],
                [Paragraph(p.get('title', ''), S['priority_title'])],
                [Paragraph(p.get('desc', ''), S['priority_body'])],
            ], colWidths=[2.3*inch])
            cell.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
                ('LINEABOVE', (0,0), (-1,0), 2, GOLD),
            ]))
            row.append(cell)
            if len(row) == 3:
                pri_rows.append(row); row = []
        if row:
            while len(row) < 3:
                row.append(Paragraph('', S['body']))
            pri_rows.append(row)

        pri_table = Table(pri_rows, colWidths=[2.3*inch, 2.3*inch, 2.3*inch], hAlign='LEFT')
        pri_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(pri_table)
        story.append(light_rule())

    # SESSION 1 FOCUSES
    focuses = data.get('focuses') or []
    if focuses:
        story.append(Paragraph('SESSION 1 COACHING PLAN', S['section_label']))
        story.append(Paragraph('Focus Areas', S['section_title']))
        story.append(Spacer(1, 4))

        for i, f in enumerate(focuses):
            block = []
            num_str = f"{i+1:02d}"
            hdr = Table([[
                Paragraph(num_str, ParagraphStyle('fn', fontName='Helvetica-Bold',
                    fontSize=20, textColor=GOLD, leading=22)),
                Paragraph(f.get('title', ''), ParagraphStyle('ft', fontName='Helvetica-Bold',
                    fontSize=12, textColor=NAVY, leading=15)),
                Paragraph(f.get('tag', ''), ParagraphStyle('ftag', fontName='Helvetica-Bold',
                    fontSize=7, textColor=WHITE, leading=9, alignment=TA_CENTER)),
            ]], colWidths=[0.5*inch, 5.2*inch, 1.0*inch])
            hdr.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BACKGROUND', (2,0), (2,0), NAVY),
                ('TOPPADDING', (2,0), (2,0), 5),
                ('BOTTOMPADDING', (2,0), (2,0), 5),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            block.append(hdr)
            block.append(Spacer(1, 4))
            block.append(Paragraph('<b>Why it matters for you</b>', S['body_bold']))
            block.append(Paragraph(f.get('why', ''), S['body']))

            drill_table = Table([[
                Paragraph('DRILL', ParagraphStyle('dl', fontName='Helvetica-Bold',
                    fontSize=7, textColor=WHITE, leading=9)),
                Paragraph(f.get('drill', ''), ParagraphStyle('dt', fontName='Helvetica',
                    fontSize=9, textColor=DARK_TEXT, leading=13)),
            ]], colWidths=[0.55*inch, 6.45*inch])
            drill_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,0), NAVY_LIGHT),
                ('BACKGROUND', (1,0), (1,0), LIGHT_BG),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 7),
                ('BOTTOMPADDING', (0,0), (-1,-1), 7),
                ('LEFTPADDING', (0,0), (0,0), 8),
                ('LEFTPADDING', (1,0), (1,0), 10),
                ('RIGHTPADDING', (1,0), (1,0), 10),
            ]))
            block.append(drill_table)

            block.append(Spacer(1, 3))
            cue_table = Table([[
                Paragraph('CUE', ParagraphStyle('cl', fontName='Helvetica-Bold',
                    fontSize=7, textColor=GOLD, leading=9)),
                Paragraph(f.get('cue', ''), ParagraphStyle('ct', fontName='Helvetica-Oblique',
                    fontSize=9.5, textColor=NAVY, leading=13)),
            ]], colWidths=[0.55*inch, 6.45*inch])
            cue_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
            ]))
            block.append(cue_table)
            block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                     spaceAfter=10, spaceBefore=8))
            story.append(KeepTogether(block))

    # TIGER 5
    tiger5 = data.get('tiger5_session1') or []
    if tiger5:
        story.append(Paragraph('TIGER 5 — COURSE MANAGEMENT SCORECARD', S['section_label']))
        story.append(Paragraph('Track Decisions, Not Score', S['section_title']))
        story.append(Paragraph(
            'Scott Fawcett (DECADE Golf) revealed that Tiger Woods used five personal rules to track '
            'avoidable errors during tournaments. Tiger\'s benchmark: <b>6 or fewer of these in 4 rounds</b> '
            'and he figured he\'d win.',
            S['body']))
        story.append(Spacer(1, 6))

        tiger_rows = []
        for t in tiger5:
            row = [
                Paragraph(t.get('num', ''), ParagraphStyle('tn', fontName='Helvetica-Bold',
                    fontSize=11, textColor=WHITE, alignment=TA_CENTER)),
                [Paragraph(t.get('title', ''), S['tiger_title']),
                 Paragraph(t.get('desc', ''), S['tiger_body'])],
                Paragraph(t.get('risk', ''),
                    ParagraphStyle('tr', fontName='Helvetica-Bold', fontSize=7.5,
                        textColor=WHITE, alignment=TA_CENTER)),
            ]
            tiger_rows.append(row)

        tiger_table = Table(tiger_rows, colWidths=[0.55*inch, 5.45*inch, 1.2*inch])
        ts = TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (0,-1), 0),
            ('LEFTPADDING', (1,0), (1,-1), 10),
            ('RIGHTPADDING', (2,0), (2,-1), 6),
            ('BACKGROUND', (0,0), (0,-1), NAVY),
            ('LINEBELOW', (0,0), (-1,-2), 0.5, RULE),
        ])
        for i, t in enumerate(tiger5):
            bg = HIGH_RISK_COLOR if 'HIGH' in (t.get('risk') or '').upper() else MANAGEABLE_COLOR
            ts.add('BACKGROUND', (2,i), (2,i), bg)
        tiger_table.setStyle(ts)
        story.append(tiger_table)
        story.append(Spacer(1, 8))

        story.append(Paragraph(
            '<b>Your assignment:</b> Track only these 5 in your next round. Not score — decisions. '
            'Bring the numbers to Session 2.',
            S['body']))
        story.append(light_rule())

    # ON-LESSON PROBES
    probes = data.get('probes') or []
    if probes:
        story.append(Paragraph('ON-LESSON OBSERVATIONS', S['section_label']))
        story.append(Paragraph('What to Watch For', S['section_title']))

        for p in probes:
            probe_row = Table([[
                Paragraph('→', ParagraphStyle('arr', fontName='Helvetica-Bold',
                    fontSize=11, textColor=GOLD)),
                [Paragraph(f"<b>{p.get('label', '')}</b>", S['body_bold']),
                 Paragraph(p.get('text', ''), S['body'])],
            ]], colWidths=[0.3*inch, 6.9*inch])
            probe_row.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 3),
                ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(probe_row)
        story.append(Spacer(1, 12))

    # CLOSING
    closing_text = data.get('session1_closing') or ''
    if closing_text:
        closing = Table([[
            Paragraph(closing_text,
                ParagraphStyle('closing', fontName='Helvetica-Oblique', fontSize=9.5,
                    textColor=NAVY_MID, leading=14)),
        ]], colWidths=[W])
        closing.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 14),
            ('RIGHTPADDING', (0,0), (-1,-1), 14),
            ('LINEleft', (0,0), (0,-1), 3, GOLD),
        ]))
        story.append(closing)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF created: {output_path}')


if __name__ == '__main__':
    build_pdf('/tmp/sample_session1_plan.pdf')
