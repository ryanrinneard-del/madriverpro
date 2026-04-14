"""
RR Golf — Player Dossier
Rendered from a structured data dict produced by the Golfer Profile Interpreter.

Usage:
    from dossier_template import build_pdf
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
from reportlab.platypus import Flowable
import math

# ── Page geometry ─────────────────────────────────────────────────────────
PW, PH    = letter
LM = RM   = 0.65 * inch
TM        = 0.85 * inch
BM        = 0.65 * inch
BODY_W    = PW - LM - RM   # 7.2 inch

# ── Brand colours ─────────────────────────────────────────────────────────
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
GREEN_LIGHT= colors.HexColor('#EEF7F1')
RED_RISK   = colors.HexColor('#C0392B')
AMBER      = colors.HexColor('#E67E22')
BLUE_NOTE  = colors.HexColor('#2980B9')

LEVEL_COLORS = {
    'GREEN': GREEN_OK,
    'BLUE':  BLUE_NOTE,
    'AMBER': AMBER,
    'RED':   RED_RISK,
}


def sty(fontName='Helvetica', fontSize=9.5, leading=14, textColor=DARK_TEXT,
        alignment=TA_LEFT, spaceBefore=0, spaceAfter=4, charSpace=0,
        leftIndent=0, **kw):
    return ParagraphStyle('_', fontName=fontName, fontSize=fontSize,
                          leading=leading, textColor=textColor,
                          alignment=alignment, spaceBefore=spaceBefore,
                          spaceAfter=spaceAfter, charSpace=charSpace,
                          leftIndent=leftIndent, **kw)


S_LABEL    = sty('Helvetica-Bold', 7,   10, GOLD,      charSpace=1.5, spaceAfter=3, spaceBefore=12)
S_H3       = sty('Helvetica-Bold', 13,  16, NAVY,      spaceAfter=5)
S_BODY     = sty('Helvetica',      9.5, 14, DARK_TEXT, spaceAfter=5)
S_BOLD     = sty('Helvetica-Bold', 9.5, 14, DARK_TEXT, spaceAfter=3)
S_SMALL    = sty('Helvetica',      8.5, 12, DARK_TEXT, spaceAfter=2)
S_SMALLB   = sty('Helvetica-Bold', 8.5, 12, DARK_TEXT, spaceAfter=2)
S_META     = sty('Helvetica',      8.5, 12, MID_GREY,  spaceAfter=4)
S_ITALIC   = sty('Helvetica-Oblique', 9.5, 14, NAVY_MID, spaceAfter=4)
S_WHITE    = sty('Helvetica-Bold', 9.5, 14, WHITE,     spaceAfter=2)
S_WHITE_SM = sty('Helvetica',      8.5, 12, colors.HexColor('#B0BEC5'), spaceAfter=2)
S_GOLD_LG  = sty('Helvetica-Bold', 28,  30, GOLD,      alignment=TA_CENTER)
S_GREY_SM  = sty('Helvetica',      7.5, 10, MID_GREY,  alignment=TA_CENTER, spaceAfter=2)


def gold_rule():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=2)


def light_rule():
    return HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8, spaceBefore=6)


def sec(label, title, story):
    story.append(Paragraph(label, S_LABEL))
    if title:
        story.append(Paragraph(title, S_H3))


# ── Radar chart ───────────────────────────────────────────────────────────
class SkillRadar(Flowable):
    def __init__(self, scores, labels, size=190):
        super().__init__()
        self.scores = scores
        self.labels = labels
        self.width = size
        self.height = size + 30

    def draw(self):
        c   = self.canv
        sz  = 190
        cx  = sz / 2
        cy  = sz / 2 + 10
        r   = sz * 0.36
        n   = max(1, len(self.scores))

        def pt(i, v):
            a = math.pi/2 + 2*math.pi*i/n
            return cx + r*(v/10)*math.cos(a), cy + r*(v/10)*math.sin(a)

        def op(i):
            a = math.pi/2 + 2*math.pi*i/n
            return cx + r*math.cos(a), cy + r*math.sin(a)

        for ring in (.25, .5, .75, 1.0):
            c.setStrokeColor(RULE); c.setLineWidth(.5)
            path = c.beginPath()
            for i in range(n):
                a = math.pi/2 + 2*math.pi*i/n
                x, y = cx + r*ring*math.cos(a), cy + r*ring*math.sin(a)
                path.moveTo(x, y) if i == 0 else path.lineTo(x, y)
            path.close(); c.drawPath(path, stroke=1, fill=0)

        for i in range(n):
            ox, oy = op(i)
            c.setStrokeColor(RULE); c.setLineWidth(.5)
            c.line(cx, cy, ox, oy)

        if self.scores:
            pts = [pt(i, self.scores[i]) for i in range(n)]
            path = c.beginPath()
            path.moveTo(*pts[0])
            for p in pts[1:]: path.lineTo(*p)
            path.close()
            c.setFillColor(GOLD)
            c.setFillAlpha(0.18)
            c.setStrokeColor(GOLD); c.setLineWidth(1.5)
            c.drawPath(path, stroke=1, fill=1)
            c.setFillAlpha(1.0)

            for i, (px, py) in enumerate(pts):
                c.setFillColor(WHITE); c.circle(px, py, 6, fill=1, stroke=0)
                c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 7)
                c.drawCentredString(px, py - 2.5, str(self.scores[i]))

        c.setFont('Helvetica-Bold', 7.5); c.setFillColor(NAVY)
        for i, label in enumerate(self.labels):
            a  = math.pi/2 + 2*math.pi*i/n
            lx = cx + (r+18)*math.cos(a)
            ly = cy + (r+18)*math.sin(a)
            c.drawCentredString(lx, ly - 4, label)


class RatingBar(Flowable):
    def __init__(self, score, width=110, height=7):
        super().__init__()
        self.score  = score
        self.width  = width
        self.height = height

    def draw(self):
        c = self.canv
        c.setFillColor(RULE)
        c.roundRect(0, 0, self.width, self.height, self.height/2, fill=1, stroke=0)
        s = self.score or 0
        col = RED_RISK if s <= 3 else AMBER if s <= 5 \
              else BLUE_NOTE if s <= 7 else GREEN_OK
        fw  = max(self.width * (s / 10.0), self.height)
        c.setFillColor(col)
        c.roundRect(0, 0, fw, self.height, self.height/2, fill=1, stroke=0)


# ── Page callbacks (need closure over student data) ───────────────────────
def _make_page_callbacks(student, date_label):
    first_name = student['first_name']
    full_name  = student['name']
    handicap   = student['handicap']
    goal       = student['goal']
    experience = student['experience']

    def cover_page(canvas, doc):
        canvas.setFillColor(WHITE)
        canvas.rect(0, 0, PW, PH, fill=1, stroke=0)
        canvas.setFillColor(NAVY)
        canvas.rect(0, PH - 0.75*inch, PW, 0.75*inch, fill=1, stroke=0)
        canvas.setFillColor(GOLD)
        canvas.rect(0, PH - 0.78*inch, PW, 0.03*inch, fill=1, stroke=0)
        canvas.setFillColor(WHITE); canvas.setFont('Helvetica-Bold', 12)
        canvas.drawString(LM, PH - 0.46*inch, 'RR GOLF')
        canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 9)
        canvas.drawRightString(PW - RM, PH - 0.46*inch, 'madriverpro.com')
        canvas.setFillColor(GOLD); canvas.setFont('Helvetica-Bold', 8)
        canvas.drawString(LM, PH - 1.2*inch, 'PLAYER DOSSIER')
        canvas.setStrokeColor(GOLD); canvas.setLineWidth(1.5)
        canvas.line(LM, PH - 1.28*inch, PW - RM, PH - 1.28*inch)
        # Player name
        canvas.setFillColor(NAVY)
        name_size = 52 if len(first_name) <= 9 else (44 if len(first_name) <= 12 else 36)
        canvas.setFont('Helvetica-Bold', name_size)
        canvas.drawString(LM, PH - 2.2*inch, first_name)
        canvas.setStrokeColor(GOLD); canvas.setLineWidth(2)
        canvas.line(LM, PH - 2.35*inch, 3.3*inch, PH - 2.35*inch)
        canvas.setFillColor(NAVY_LIGHT); canvas.setFont('Helvetica', 12)
        sub_line = f'Handicap {handicap}  \xb7  Goal: {goal}  \xb7  {experience}'
        canvas.drawString(LM, PH - 2.65*inch, sub_line)
        # Credentials box
        bx, by, bw, bh = PW - 2.4*inch, PH - 3.25*inch, 1.75*inch, 1.2*inch
        canvas.setFillColor(LIGHT_BG); canvas.setStrokeColor(NAVY)
        canvas.setLineWidth(1)
        canvas.roundRect(bx, by, bw, bh, 4, fill=1, stroke=1)
        canvas.setFillColor(GOLD); canvas.setFont('Helvetica-Bold', 7.5)
        canvas.drawCentredString(bx + bw/2, by + bh - 0.21*inch, 'CPGA CLASS A')
        canvas.setFillColor(NAVY); canvas.setFont('Helvetica', 8)
        for i, txt in enumerate(['TrackMan Certified', 'TPI Level 3', 'Vision54 Coach', 'Titleist Ambassador']):
            canvas.drawCentredString(bx + bw/2, by + bh - (0.39 + i*0.18)*inch, txt)
        canvas.setStrokeColor(RULE); canvas.setLineWidth(0.5)
        canvas.line(LM, 1.65*inch, PW - RM, 1.65*inch)
        canvas.setFillColor(NAVY); canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(LM, 1.4*inch, 'Ryan Rinneard')
        canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 9)
        footer_line = f'Director of Instruction  \xb7  Mad River Golf Club'
        if date_label:
            footer_line += f'  \xb7  {date_label}'
        canvas.drawString(LM, 1.15*inch, footer_line)
        canvas.drawRightString(PW - RM, 1.15*inch, 'Confidential \u2014 For Coaching Use')

    def inner_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, PH - 0.55*inch, PW, 0.55*inch, fill=1, stroke=0)
        canvas.setFillColor(WHITE); canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(LM, PH - 0.34*inch, 'RR GOLF')
        canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 8)
        canvas.drawRightString(PW - RM, PH - 0.34*inch, f'Player Dossier \u2014 {first_name}')
        canvas.setStrokeColor(GOLD); canvas.setLineWidth(1.5)
        canvas.line(0, PH - 0.55*inch, PW, PH - 0.55*inch)
        canvas.setFillColor(RULE)
        canvas.rect(0, 0, PW, 0.45*inch, fill=1, stroke=0)
        canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 7.5)
        canvas.drawCentredString(PW/2, 0.17*inch,
            f'Ryan Rinneard \xb7 Director of Instruction \xb7 Mad River Golf Club \xb7 Page {doc.page}')
        canvas.restoreState()

    def on_page(canvas, doc):
        if doc.page == 1:
            cover_page(canvas, doc)
        else:
            inner_page(canvas, doc)

    return on_page


def _student(data):
    s = (data or {}).get('student', {}) or {}
    return {
        'name':        s.get('name') or 'Player',
        'first_name':  s.get('first_name') or (s.get('name') or 'Player').split()[0],
        'handicap':    s.get('handicap') or '—',
        'goal':        s.get('goal') or '—',
        'experience':  s.get('experience') or '—',
    }


# ── BUILD ─────────────────────────────────────────────────────────────────
def build_pdf(output_path, data=None):
    if data is None:
        from _sample_data import SAMPLE_DATA
        data = SAMPLE_DATA

    student = _student(data)
    date_label = data.get('date_label') or ''
    on_page = _make_page_callbacks(student, date_label)

    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=LM, rightMargin=RM,
        topMargin=TM, bottomMargin=BM,
    )
    story = []

    # ── COVER (canvas-only) ────────────────────────────────────────────────
    story.append(PageBreak())

    # ── PAGE 2 — PLAYER IDENTITY ───────────────────────────────────────────
    story.append(Spacer(1, 4))
    sec('PLAYER IDENTITY', f"{student['first_name']}'s Golf Story", story)

    for para in (data.get('identity_paragraphs') or []):
        story.append(Paragraph(para, S_BODY))

    story.append(gold_rule())

    # Stat strip
    stat_strip = data.get('stat_strip') or []
    if len(stat_strip) == 5:
        COL5 = BODY_W / 5
        stat_row = []
        for item in stat_strip:
            stat_row.append([
                Paragraph(item.get('value', ''),
                          sty('Helvetica-Bold', 20, 24, GOLD, TA_CENTER)),
                Paragraph(item.get('label', ''), S_GREY_SM),
            ])
        stat_table = Table([stat_row], colWidths=[COL5]*5)
        stat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEABOVE', (0,0), (0,-1), 2, GOLD),
            ('LINEABOVE', (4,0), (4,-1), 2, GOLD),
        ]))
        story.append(stat_table)
        story.append(light_rule())

    # ── SKILL MAP ─────────────────────────────────────────────────────────
    skill_radar = data.get('skill_radar') or {}
    skill_notes = data.get('skill_notes') or []
    if skill_radar.get('labels') and skill_radar.get('scores') and len(skill_notes) == 6:
        sec('SKILL MAP', 'Game at a Glance', story)
        story.append(Paragraph(
            'Scores derived from self-reported confidence ratings, performance data, and coaching '
            'interpretation. Starting-point baselines \u2014 not fixed assessments.', S_META))

        RADAR_W = 2.6 * inch
        SKILL_W = BODY_W - RADAR_W
        A_W, B_W, SC_W, N_W = 1.0*inch, 1.2*inch, 0.55*inch, 1.85*inch

        skill_rows = []
        for note in skill_notes:
            score = note.get('score', 0)
            col = LEVEL_COLORS.get(note.get('level', 'AMBER'), AMBER)
            skill_rows.append([
                Paragraph(note.get('area', ''), S_SMALLB),
                RatingBar(score, width=B_W - 4, height=7),
                Paragraph(f'{score}/10', sty('Helvetica-Bold', 8.5, 12, col, TA_CENTER)),
                Paragraph(note.get('note', ''), S_SMALL),
            ])
        skill_tbl = Table(skill_rows, colWidths=[A_W, B_W, SC_W, N_W])
        skill_tbl.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LINEBELOW', (0,0), (-1,-2), 0.5, RULE),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
        ]))

        map_tbl = Table(
            [[SkillRadar(skill_radar['scores'], skill_radar['labels'], size=190), skill_tbl]],
            colWidths=[RADAR_W, SKILL_W])
        map_tbl.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (0,0), 0),
            ('RIGHTPADDING', (0,0), (0,0), 8),
            ('LEFTPADDING', (1,0), (1,0), 0),
        ]))
        story.append(map_tbl)
        story.append(light_rule())

    # ── PAGE 3 — FULL GAME DIAGNOSTIC ─────────────────────────────────────
    diag_sections = data.get('diagnostic_sections') or []
    if diag_sections:
        story.append(PageBreak())
        sec('FULL GAME DIAGNOSTIC', 'Section-by-Section Analysis', story)

        for ds in diag_sections:
            block = []
            flag_col = LEVEL_COLORS.get(ds.get('flag_level', 'AMBER'), AMBER)

            hdr = Table([[
                Paragraph(ds.get('title', ''), sty('Helvetica-Bold', 10, 13, NAVY)),
                Paragraph(ds.get('flag_label', ''),
                          sty('Helvetica-Bold', 8, 11, flag_col, TA_RIGHT)),
            ]], colWidths=[5.0*inch, 2.2*inch])
            hdr.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
                ('TOPPADDING', (0,0), (-1,-1), 7),
                ('BOTTOMPADDING', (0,0), (-1,-1), 7),
                ('LEFTPADDING', (0,0), (0,0), 10),
                ('RIGHTPADDING', (1,0), (1,0), 10),
                ('LINEABOVE', (0,0), (-1,0), 1.5, GOLD),
            ]))
            block.append(hdr)
            block.append(Spacer(1, 4))
            block.append(Paragraph(ds.get('body', ''), S_SMALL))
            block.append(Spacer(1, 3))

            for flag in (ds.get('flags') or []):
                f_col = LEVEL_COLORS.get(flag.get('level', 'AMBER'), AMBER)
                frow = Table([[
                    Paragraph(flag.get('prefix', ''),
                              sty('Helvetica-Bold', 7.5, 11, f_col)),
                    Paragraph(flag.get('text', ''),
                              sty('Helvetica', 8.5, 12, f_col)),
                ]], colWidths=[0.75*inch, 6.45*inch])
                frow.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('TOPPADDING', (0,0), (-1,-1), 1),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                    ('LEFTPADDING', (0,0), (-1,-1), 0),
                ]))
                block.append(frow)

            block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                     spaceAfter=10, spaceBefore=6))
            story.append(KeepTogether(block))

    # ── PAGE 4 — PRIORITY PRESCRIPTION ─────────────────────────────────────
    prescriptions = data.get('prescriptions') or []
    if prescriptions:
        story.append(PageBreak())
        sec('PRIORITY PRESCRIPTION', 'Ranked by Scoring Impact', story)
        story.append(Paragraph(
            'Every recommendation below is connected directly to your stated goals. '
            'This is the sequence that gets you to scratch fastest.', S_BODY))
        story.append(Spacer(1, 6))

        for p in prescriptions:
            col = LEVEL_COLORS.get(p.get('level', 'AMBER'), AMBER)
            block = []
            row = Table([[
                Paragraph(p.get('num', ''), sty('Helvetica-Bold', 22, 24, GOLD, TA_CENTER)),
                [Paragraph(p.get('title', ''), sty('Helvetica-Bold', 10, 13, NAVY)),
                 Paragraph(p.get('goal_link', ''), sty('Helvetica', 8, 11, GOLD)),
                 Paragraph(p.get('body', ''), sty('Helvetica', 8.5, 12, DARK_TEXT))],
            ]], colWidths=[0.55*inch, 6.65*inch])
            row.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BACKGROUND', (0,0), (0,0), NAVY),
                ('BACKGROUND', (1,0), (1,0), LIGHT_BG),
                ('TOPPADDING', (0,0), (-1,-1), 9),
                ('BOTTOMPADDING', (0,0), (-1,-1), 9),
                ('LEFTPADDING', (1,0), (1,0), 10),
                ('RIGHTPADDING', (1,0), (1,0), 10),
                ('LINEABOVE', (0,0), (-1,0), 2, col),
            ]))
            block.append(row)
            block.append(Spacer(1, 5))
            story.append(KeepTogether(block))

        story.append(light_rule())

    # ── TIGER 5 PERSONAL PROFILE ──────────────────────────────────────────
    tiger5 = data.get('tiger5_dossier') or []
    if tiger5:
        sec('TIGER 5 PERSONAL PROFILE', 'Your Avoidable Error Map', story)
        story.append(Paragraph(
            "Scott Fawcett (DECADE Golf) revealed that Tiger Woods tracked 5 specific avoidable errors "
            "each tournament. Tiger's target: <b>6 or fewer per 4 rounds</b>. Here's how each maps "
            f"to {student['first_name']}'s game right now.", S_BODY))
        story.append(Spacer(1, 4))

        for t in tiger5:
            risk_col = LEVEL_COLORS.get(t.get('risk_level', 'AMBER'), AMBER)
            block = []
            t_row = Table([[
                Paragraph(t.get('num', ''), sty('Helvetica-Bold', 11, 13, WHITE, TA_CENTER)),
                [Paragraph(t.get('title', ''), sty('Helvetica-Bold', 10, 13, NAVY)),
                 Paragraph(t.get('diag', ''), sty('Helvetica', 8.5, 12, DARK_TEXT))],
                Paragraph(t.get('risk_label', ''),
                          sty('Helvetica-Bold', 7.5, 11, WHITE, TA_CENTER)),
            ]], colWidths=[0.5*inch, 5.5*inch, 1.2*inch])
            t_row.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,0), NAVY),
                ('BACKGROUND', (2,0), (2,0), risk_col),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (1,0), (1,0), 10),
                ('RIGHTPADDING', (1,0), (1,0), 6),
            ]))
            block.append(t_row)

            px_row = Table([[
                Paragraph('PRESCRIPTION', sty('Helvetica-Bold', 7, 10, GOLD, charSpace=1)),
                Paragraph(t.get('rx', ''), S_SMALL),
            ]], colWidths=[1.1*inch, 6.1*inch])
            px_row.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (0,0), 8),
                ('LEFTPADDING', (1,0), (1,0), 6),
                ('RIGHTPADDING', (1,0), (1,0), 8),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            block.append(px_row)
            block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                     spaceAfter=7, spaceBefore=3))
            story.append(KeepTogether(block))

    # ── PAGE 5 — ARC SUMMARY + GOALS CONTRACT ─────────────────────────────
    arc_phases = data.get('arc_phases') or []
    if arc_phases:
        story.append(PageBreak())
        sec('6-WEEK ARC SUMMARY', 'The Road to Your Goal', story)
        story.append(Paragraph(
            'Full session-by-session detail is in the accompanying Arc document. '
            'This summary shows the progression logic and what each phase is building toward.', S_BODY))
        story.append(Spacer(1, 4))

        ARC_L = 3.8 * inch
        ARC_R = BODY_W - ARC_L

        for ph in arc_phases:
            block = []
            hdr = Table([[
                Paragraph(ph.get('title', ''), S_WHITE),
                Paragraph(ph.get('name', ''), S_WHITE_SM),
            ]], colWidths=[1.5*inch, 5.7*inch])
            hdr.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), NAVY_MID),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            block.append(hdr)

            item_rows = [[
                Paragraph('\u25c6', sty('Helvetica-Bold', 7, 11, GOLD)),
                Paragraph(item, sty('Helvetica', 8.5, 12, DARK_TEXT)),
            ] for item in (ph.get('items') or [])]
            item_tbl = Table(item_rows, colWidths=[0.2*inch, ARC_L - 0.4*inch]) if item_rows else \
                       Table([[Paragraph('', S_SMALL)]], colWidths=[ARC_L - 0.4*inch])
            item_tbl.setStyle(TableStyle([
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))

            chk_tbl = Table([[
                Paragraph('READY WHEN', sty('Helvetica-Bold', 7, 10, GOLD, charSpace=1)),
                Paragraph(ph.get('checkpoint', ''), sty('Helvetica', 8.5, 12, GREEN_OK)),
            ]], colWidths=[ARC_R])
            chk_tbl.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), GREEN_LIGHT),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ]))

            content = Table([[item_tbl, chk_tbl]], colWidths=[ARC_L, ARC_R])
            content.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BACKGROUND', (0,0), (0,0), LIGHT_BG),
                ('TOPPADDING', (0,0), (0,0), 8),
                ('BOTTOMPADDING', (0,0), (0,0), 8),
                ('LEFTPADDING', (0,0), (0,0), 8),
                ('RIGHTPADDING', (0,0), (0,0), 4),
                ('LEFTPADDING', (1,0), (1,0), 0),
                ('RIGHTPADDING', (1,0), (1,0), 0),
            ]))
            block.append(content)
            block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                     spaceAfter=7, spaceBefore=2))
            story.append(KeepTogether(block))

        story.append(light_rule())

    # ── GOALS CONTRACT ────────────────────────────────────────────────────
    goals = data.get('goals') or []
    if goals:
        sec('GOALS CONTRACT', 'Commitments with Timelines', story)
        story.append(Paragraph(
            'Your goals rewritten as specific, measurable targets. '
            'Not wishes \u2014 commitments.', S_BODY))
        story.append(Spacer(1, 4))

        for g in goals:
            block = []
            g_hdr = Table([[
                Paragraph(g.get('num', ''), sty('Helvetica-Bold', 22, 24, GOLD, TA_CENTER)),
                [Paragraph(g.get('title', ''), sty('Helvetica-Bold', 10, 13, NAVY)),
                 Paragraph(g.get('context', ''), sty('Helvetica', 8.5, 12, DARK_TEXT))],
            ]], colWidths=[0.55*inch, 6.65*inch])
            g_hdr.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,0), NAVY),
                ('BACKGROUND', (1,0), (1,0), LIGHT_BG),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LEFTPADDING', (1,0), (1,0), 10),
                ('RIGHTPADDING', (1,0), (1,0), 10),
                ('LINEABOVE', (0,0), (-1,0), 2, GOLD),
            ]))
            block.append(g_hdr)

            metrics = g.get('metrics') or []
            m_rows = [[
                Paragraph(m.get('label', ''), sty('Helvetica-Bold', 8.5, 12, MID_GREY)),
                Paragraph(m.get('value', ''), sty('Helvetica', 8.5, 12, DARK_TEXT)),
            ] for m in metrics]
            if m_rows:
                m_tbl = Table(m_rows, colWidths=[1.3*inch, 5.9*inch])
                m_tbl.setStyle(TableStyle([
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('LEFTPADDING', (0,0), (0,-1), 14),
                    ('LEFTPADDING', (1,0), (1,-1), 8),
                    ('RIGHTPADDING', (1,0), (1,-1), 8),
                    ('LINEBELOW', (0,0), (-1,-2), 0.5, RULE),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ]))
                block.append(m_tbl)
            block.append(Spacer(1, 7))
            story.append(KeepTogether(block))

        story.append(light_rule())

    # ── CLOSING ───────────────────────────────────────────────────────────
    dossier_closing = data.get('dossier_closing') or ''
    if dossier_closing:
        sec('COACHING COMMITMENT', '', story)
        close_tbl = Table([[
            Paragraph(dossier_closing, sty('Helvetica-Oblique', 9.5, 15, NAVY_MID)),
        ]], colWidths=[BODY_W])
        close_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
            ('TOPPADDING', (0,0), (-1,-1), 14),
            ('BOTTOMPADDING', (0,0), (-1,-1), 14),
            ('LEFTPADDING', (0,0), (-1,-1), 14),
            ('RIGHTPADDING', (0,0), (-1,-1), 14),
            ('LINEABOVE', (0,0), (-1,0), 2, GOLD),
        ]))
        story.append(close_tbl)
        story.append(Spacer(1, 10))

    sig = Table([[
        Paragraph('<b>Ryan Rinneard</b>', sty('Helvetica-Bold', 9.5, 13, NAVY)),
        Paragraph('CPGA Class A \xb7 TrackMan \xb7 TPI G3 \xb7 Vision54 \xb7 Mad River Golf Club',
                  sty('Helvetica', 8.5, 12, MID_GREY, TA_RIGHT)),
    ]], colWidths=[2.5*inch, 4.7*inch])
    sig.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
    story.append(sig)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF created: {output_path}')


if __name__ == '__main__':
    build_pdf('/tmp/sample_dossier.pdf')
