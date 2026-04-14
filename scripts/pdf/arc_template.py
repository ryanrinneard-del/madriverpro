"""
RR Golf — 6-Week Coaching Arc
Rendered from a structured data dict produced by the Golfer Profile Interpreter.

Usage:
    from arc_template import build_pdf
    build_pdf('/tmp/out.pdf', data)   # data is the analysis.json payload

For standalone testing, running the module with no data uses the sample payload
in scripts/pdf/_sample_data.py.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, KeepTogether, PageBreak)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ── Brand colours ──────────────────────────────────────────────────────────
NAVY       = colors.HexColor('#0A1628')
NAVY_MID   = colors.HexColor('#1A2E4A')
NAVY_LIGHT = colors.HexColor('#2C4A6E')
GOLD       = colors.HexColor('#C9A84C')
WHITE      = colors.white
LIGHT_BG   = colors.HexColor('#F7F8FA')
MID_GREY   = colors.HexColor('#8A9BB0')
DARK_TEXT  = colors.HexColor('#1A1A2E')
RULE       = colors.HexColor('#DDE3EC')
GREEN_OK   = colors.HexColor('#27AE60')
RED_RISK   = colors.HexColor('#C0392B')
AMBER      = colors.HexColor('#E67E22')

W = 7.2 * inch


def on_page(canvas, doc):
    pw, ph = letter
    margin = 0.65 * inch
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, ph - 0.55*inch, pw, 0.55*inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(margin, ph - 0.34*inch, 'RR GOLF')
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MID_GREY)
    canvas.drawRightString(pw - margin, ph - 0.34*inch, 'madriverpro.com')
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.5)
    canvas.line(0, ph - 0.55*inch, pw, ph - 0.55*inch)
    canvas.setFillColor(RULE)
    canvas.rect(0, 0, pw, 0.45*inch, fill=1, stroke=0)
    canvas.setFillColor(MID_GREY)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawCentredString(pw/2, 0.17*inch,
        f'Ryan Rinneard · Director of Instruction · Mad River Golf Club · Page {doc.page}')
    canvas.restoreState()


def S(name, **kw):
    base = {
        'doc_title':     dict(fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=NAVY, spaceAfter=2),
        'section_label': dict(fontName='Helvetica-Bold', fontSize=7,  leading=10, textColor=GOLD, spaceBefore=14, spaceAfter=4, charSpace=1.5),
        'section_title': dict(fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=NAVY, spaceAfter=6),
        'body':          dict(fontName='Helvetica',      fontSize=9.5,leading=14, textColor=DARK_TEXT, spaceAfter=5),
        'body_bold':     dict(fontName='Helvetica-Bold', fontSize=9.5,leading=14, textColor=DARK_TEXT, spaceAfter=3),
        'small':         dict(fontName='Helvetica',      fontSize=8.5,leading=12, textColor=DARK_TEXT),
        'small_bold':    dict(fontName='Helvetica-Bold', fontSize=8.5,leading=12, textColor=DARK_TEXT),
        'meta':          dict(fontName='Helvetica',      fontSize=9,  leading=12, textColor=MID_GREY),
        'italic':        dict(fontName='Helvetica-Oblique', fontSize=9.5, leading=14, textColor=NAVY_MID, spaceAfter=4),
        'footer_note':   dict(fontName='Helvetica-Oblique', fontSize=8.5, leading=12, textColor=MID_GREY),
        'tag':           dict(fontName='Helvetica-Bold', fontSize=7,  leading=9,  textColor=WHITE, alignment=TA_CENTER),
        'week_num':      dict(fontName='Helvetica-Bold', fontSize=28, leading=30, textColor=GOLD, alignment=TA_CENTER),
        'week_theme':    dict(fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=NAVY),
        'week_sub':      dict(fontName='Helvetica',      fontSize=8.5,leading=12, textColor=MID_GREY, spaceAfter=6),
        'check':         dict(fontName='Helvetica-Bold', fontSize=8.5,leading=12, textColor=GREEN_OK),
        'stat_num':      dict(fontName='Helvetica-Bold', fontSize=20, leading=22, textColor=NAVY, alignment=TA_CENTER),
        'stat_label':    dict(fontName='Helvetica',      fontSize=7.5,leading=10, textColor=MID_GREY, alignment=TA_CENTER),
    }
    d = dict(base[name])
    d.update(kw)
    return ParagraphStyle(name, **d)


def gold_rule():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=2)


def light_rule():
    return HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8, spaceBefore=6)


def section_header(label, title, story):
    story.append(Paragraph(label, S('section_label')))
    story.append(Paragraph(title, S('section_title')))


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

    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.85*inch, bottomMargin=0.65*inch,
    )
    story = []
    student = _student(data)
    arc_date = data.get('arc_date_label') or data.get('date_label') or ''

    # ── TITLE BLOCK ────────────────────────────────────────────────────────
    story.append(Spacer(1, 6))
    hdr = Table([[
        Paragraph('6-Week Coaching Arc', S('doc_title')),
        Paragraph(arc_date, S('meta', alignment=TA_RIGHT)),
    ]], colWidths=[5.2*inch, 2.0*inch])
    hdr.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
                              ('ALIGN', (1,0), (1,0), 'RIGHT')]))
    story.append(hdr)
    story.append(gold_rule())

    meta = Table([[
        Paragraph(f"<b>{student['first_name']}</b>", S('body_bold', fontSize=11, textColor=NAVY)),
        Paragraph(f"Handicap: <b>{student['handicap']}</b>", S('small')),
        Paragraph(f"Goal: <b>{student['goal']}</b>", S('small')),
        Paragraph('Sessions: <b>6 × 60 min</b>', S('small')),
        Paragraph('Coach: <b>Ryan Rinneard</b>', S('small', alignment=TA_RIGHT)),
    ]], colWidths=[1.5*inch, 1.3*inch, 1.6*inch, 1.2*inch, 1.6*inch])
    meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (0,-1), 10),
        ('RIGHTPADDING', (-1,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta)
    story.append(Spacer(1, 14))

    # ── ARC OVERVIEW ───────────────────────────────────────────────────────
    section_header('THE PLAN', "What We're Building Over 6 Weeks", story)
    arc_intro = data.get('arc_intro') or ''
    if arc_intro:
        story.append(Paragraph(arc_intro, S('body')))

    # Three themes
    themes = data.get('arc_themes') or []
    if themes:
        theme_cells = []
        for t in themes[:3]:
            theme_cells.append(
                Table([[
                    Paragraph(t.get('label', ''), S('section_label', spaceBefore=0)),
                    Paragraph(t.get('title', ''), S('body_bold', spaceAfter=2)),
                    Paragraph(t.get('body', ''), S('small')),
                ]], colWidths=[2.2*inch])
            )
        while len(theme_cells) < 3:
            theme_cells.append(Paragraph('', S('small')))

        theme_table = Table([theme_cells], colWidths=[2.2*inch, 2.2*inch, 2.2*inch], hAlign='LEFT')
        theme_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
            ('LINEABOVE', (0,0), (0,-1), 2, GOLD),
            ('LINEABOVE', (1,0), (1,-1), 2, NAVY_MID),
            ('LINEABOVE', (2,0), (2,-1), 2, NAVY_LIGHT),
        ]))
        story.append(theme_table)
    story.append(light_rule())

    # ── SESSION-BY-SESSION ─────────────────────────────────────────────────
    section_header('THE SESSIONS', 'Week-by-Week Breakdown', story)
    story.append(Spacer(1, 4))

    sessions = data.get('sessions') or []
    for sess in sessions:
        block = []

        # Week header bar
        wk_hdr = Table([[
            Paragraph(sess.get('week', ''), S('week_num')),
            [Paragraph(sess.get('theme', ''), S('week_theme')),
             Paragraph(sess.get('subtitle', ''), S('week_sub'))],
        ]], colWidths=[0.65*inch, 6.55*inch])
        wk_hdr.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), NAVY),
            ('BACKGROUND', (1,0), (1,0), LIGHT_BG),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (1,0), (1,0), 12),
            ('LINEABOVE', (0,0), (-1,0), 2, GOLD),
        ]))
        block.append(wk_hdr)
        block.append(Spacer(1, 6))

        focus_data = [[
            [Paragraph('PRIMARY FOCUS', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess.get('primary', ''), S('small'))],
            [Paragraph('SECONDARY FOCUS', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess.get('secondary', ''), S('small'))],
        ]]
        focus_table = Table(focus_data, colWidths=[3.55*inch, 3.55*inch])
        focus_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (0,-1), 12),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        block.append(focus_table)
        block.append(Spacer(1, 8))

        block.append(Paragraph('BETWEEN-SESSION PRACTICE',
                               S('section_label', spaceBefore=0, spaceAfter=4)))
        for p in (sess.get('practice') or []):
            row = Table([[
                Paragraph('◆', ParagraphStyle('dot', fontName='Helvetica-Bold',
                    fontSize=7, textColor=GOLD, leading=12)),
                Paragraph(p, S('small')),
            ]], colWidths=[0.2*inch, 7.0*inch])
            row.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 1),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
            ]))
            block.append(row)

        block.append(Spacer(1, 6))

        bottom_data = [[
            [Paragraph('TIGER 5 FOCUS', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess.get('tiger5', ''), S('small'))],
            [Paragraph('READY TO PROGRESS WHEN', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess.get('ready_when', ''), S('small', textColor=GREEN_OK))],
            [Paragraph('MEASURE', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess.get('measure', ''), S('small'))],
        ]]
        bottom_table = Table(bottom_data, colWidths=[2.8*inch, 2.4*inch, 2.0*inch])
        bottom_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 7),
            ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('BACKGROUND', (0,0), (0,-1), LIGHT_BG),
            ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#EEF7F1')),
            ('BACKGROUND', (2,0), (2,-1), LIGHT_BG),
        ]))
        block.append(bottom_table)
        block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                 spaceAfter=12, spaceBefore=8))

        story.append(KeepTogether(block))

    # ── PROGRESS MARKERS ───────────────────────────────────────────────────
    progress_markers = data.get('progress_markers') or []
    if progress_markers:
        story.append(PageBreak())
        section_header('MEASURING PROGRESS', 'What Success Looks Like', story)
        story.append(Paragraph(
            "These are the numbers we're moving. Track them after every round and bring them to each session.",
            S('body')))
        story.append(Spacer(1, 6))

        pm_header = [
            Paragraph('METRIC', S('section_label', spaceBefore=0, textColor=WHITE)),
            Paragraph('NOW', S('section_label', spaceBefore=0, textColor=WHITE)),
            Paragraph('TARGET (6 WKS)', S('section_label', spaceBefore=0, textColor=WHITE)),
            Paragraph('WHY IT MATTERS', S('section_label', spaceBefore=0, textColor=WHITE)),
        ]
        pm_rows = [pm_header]
        for pm in progress_markers:
            pm_rows.append([
                Paragraph(pm.get('metric', ''), S('small_bold')),
                Paragraph(pm.get('now', ''),    S('small', textColor=RED_RISK)),
                Paragraph(pm.get('target', ''), S('small', textColor=GREEN_OK)),
                Paragraph(pm.get('why', ''),    S('small')),
            ])

        pm_table = Table(pm_rows, colWidths=[1.6*inch, 1.1*inch, 1.4*inch, 3.1*inch])
        pm_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), NAVY),
            ('TEXTCOLOR', (0,0), (-1,0), WHITE),
            ('TOPPADDING', (0,0), (-1,-1), 7),
            ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG]),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, RULE),
        ]))
        story.append(pm_table)
        story.append(light_rule())

    # ── PRACTICE PRINCIPLES ────────────────────────────────────────────────
    practice_principles = data.get('practice_principles') or []
    if practice_principles and len(practice_principles) >= 4:
        section_header('PRACTICE PRINCIPLES', 'How to Get the Most Out of the Work', story)
        story.append(Spacer(1, 4))

        def _pp_cell(idx, pp):
            return Table([[
                Paragraph(f'0{idx+1}', S('section_label', spaceBefore=0, spaceAfter=2, textColor=NAVY_LIGHT)),
                Paragraph(pp.get('title', ''), S('body_bold', spaceAfter=2)),
                Paragraph(pp.get('body', ''), S('small')),
            ]], colWidths=[3.45*inch])

        row_a = [_pp_cell(i, practice_principles[i]) for i in range(0, 2)]
        row_b = [_pp_cell(i, practice_principles[i]) for i in range(2, 4)]
        pp_table = Table([row_a, row_b], colWidths=[3.55*inch, 3.55*inch])
        pp_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
            ('LINEABOVE', (0,0), (0,-1), 1.5, GOLD),
            ('LINEABOVE', (1,0), (1,-1), 1.5, GOLD),
        ]))
        story.append(pp_table)
        story.append(light_rule())

    # ── TIGER 5 TRACKING CARD ──────────────────────────────────────────────
    section_header('TIGER 5 TRACKING', 'Your Mental Scorecard — Every Round', story)
    story.append(Paragraph(
        "After every round, record how many times each of these happened. "
        "You're not tracking score — you're tracking <b>decision quality</b>. "
        "Bring this to every session.",
        S('body')))
    story.append(Spacer(1, 6))

    t5_items = [
        ('#1', 'Bogey or worse on a par 5'),
        ('#2', 'Big number (double bogey or worse)'),
        ('#3', 'Blown easy save inside 15 yards'),
        ('#4', 'Three-putt'),
        ('#5', 'Bogey with 9-iron or shorter'),
    ]
    t5_header = [
        Paragraph('', S('small')),
        Paragraph('EVENT',  S('section_label', spaceBefore=0, textColor=WHITE)),
        Paragraph('WK 1',   S('section_label', spaceBefore=0, textColor=WHITE)),
        Paragraph('WK 2',   S('section_label', spaceBefore=0, textColor=WHITE)),
        Paragraph('WK 3',   S('section_label', spaceBefore=0, textColor=WHITE)),
        Paragraph('WK 4',   S('section_label', spaceBefore=0, textColor=WHITE)),
        Paragraph('WK 5',   S('section_label', spaceBefore=0, textColor=WHITE)),
        Paragraph('WK 6',   S('section_label', spaceBefore=0, textColor=WHITE)),
    ]
    t5_rows = [t5_header]
    for num, event in t5_items:
        t5_rows.append([
            Paragraph(num, S('small_bold', textColor=GOLD)),
            Paragraph(event, S('small')),
            Paragraph('', S('small')), Paragraph('', S('small')),
            Paragraph('', S('small')), Paragraph('', S('small')),
            Paragraph('', S('small')), Paragraph('', S('small')),
        ])
    t5_rows.append([
        Paragraph('', S('small')),
        Paragraph('<b>TOTAL (target: ≤ 6)</b>', S('small_bold')),
        Paragraph('', S('small')), Paragraph('', S('small')),
        Paragraph('', S('small')), Paragraph('', S('small')),
        Paragraph('', S('small')), Paragraph('', S('small')),
    ])
    t5_table = Table(t5_rows,
        colWidths=[0.4*inch, 2.8*inch, 0.65*inch, 0.65*inch, 0.65*inch, 0.65*inch, 0.65*inch, 0.65*inch])
    t5_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [WHITE, LIGHT_BG]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#EEF0F5')),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, RULE),
        ('ALIGN', (2,0), (-1,-1), 'CENTER'),
        ('LINEAFTER', (1,1), (1,-1), 0.5, RULE),
    ]))
    story.append(t5_table)
    story.append(light_rule())

    # ── COMMITMENT CLOSE ──────────────────────────────────────────────────
    arc_closing = data.get('arc_closing') or ''
    if arc_closing:
        section_header('THE COMMITMENT', 'A Note From Your Coach', story)
        story.append(Spacer(1, 4))
        close_block = Table([[
            Paragraph(arc_closing, S('italic', fontSize=10, leading=16, textColor=NAVY_MID)),
        ]], colWidths=[W])
        close_block.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
            ('TOPPADDING', (0,0), (-1,-1), 14),
            ('BOTTOMPADDING', (0,0), (-1,-1), 14),
            ('LEFTPADDING', (0,0), (-1,-1), 16),
            ('RIGHTPADDING', (0,0), (-1,-1), 16),
            ('LINEABOVE', (0,0), (-1,0), 2, GOLD),
        ]))
        story.append(close_block)
        story.append(Spacer(1, 10))

    sig = Table([[
        Paragraph('<b>Ryan Rinneard</b>', S('body_bold', textColor=NAVY)),
        Paragraph('CPGA Class A · TrackMan · TPI G3 · Vision54',
            S('meta', alignment=TA_RIGHT)),
    ]], colWidths=[3.0*inch, 4.2*inch])
    sig.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    story.append(sig)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF created: {output_path}')


if __name__ == '__main__':
    build_pdf('/tmp/sample_6week_arc.pdf')
