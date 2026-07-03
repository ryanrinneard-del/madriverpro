from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Flowable

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

# ── Styles ─────────────────────────────────────────────────────────────────
def styles():
    return {
        'doc_title': ParagraphStyle('doc_title',
            fontName='Helvetica-Bold', fontSize=22, leading=26,
            textColor=NAVY, spaceAfter=2),
        'doc_subtitle': ParagraphStyle('doc_subtitle',
            fontName='Helvetica', fontSize=11, leading=14,
            textColor=MID_GREY, spaceAfter=4),
        'meta': ParagraphStyle('meta',
            fontName='Helvetica', fontSize=9, leading=12,
            textColor=MID_GREY),
        'section_label': ParagraphStyle('section_label',
            fontName='Helvetica-Bold', fontSize=7, leading=10,
            textColor=GOLD, spaceBefore=16, spaceAfter=4,
            charSpace=1.5),
        'section_title': ParagraphStyle('section_title',
            fontName='Helvetica-Bold', fontSize=13, leading=16,
            textColor=NAVY, spaceAfter=6),
        'body': ParagraphStyle('body',
            fontName='Helvetica', fontSize=9.5, leading=14,
            textColor=DARK_TEXT, spaceAfter=6),
        'body_bold': ParagraphStyle('body_bold',
            fontName='Helvetica-Bold', fontSize=9.5, leading=14,
            textColor=DARK_TEXT, spaceAfter=4),
        'bullet': ParagraphStyle('bullet',
            fontName='Helvetica', fontSize=9.5, leading=14,
            textColor=DARK_TEXT, leftIndent=14, spaceAfter=3,
            bulletIndent=0),
        'cue_label': ParagraphStyle('cue_label',
            fontName='Helvetica-Bold', fontSize=8, leading=10,
            textColor=GOLD, spaceAfter=2),
        'cue_text': ParagraphStyle('cue_text',
            fontName='Helvetica-Oblique', fontSize=9, leading=13,
            textColor=NAVY_MID, spaceAfter=2),
        'tag': ParagraphStyle('tag',
            fontName='Helvetica-Bold', fontSize=7.5, leading=10,
            textColor=WHITE),
        'footer': ParagraphStyle('footer',
            fontName='Helvetica', fontSize=7.5, leading=10,
            textColor=MID_GREY, alignment=TA_CENTER),
        'priority_num': ParagraphStyle('priority_num',
            fontName='Helvetica-Bold', fontSize=18, leading=20,
            textColor=GOLD, alignment=TA_CENTER),
        'priority_title': ParagraphStyle('priority_title',
            fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=NAVY),
        'priority_body': ParagraphStyle('priority_body',
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=DARK_TEXT),
        'tiger_num': ParagraphStyle('tiger_num',
            fontName='Helvetica-Bold', fontSize=9, leading=11,
            textColor=WHITE, alignment=TA_CENTER),
        'tiger_title': ParagraphStyle('tiger_title',
            fontName='Helvetica-Bold', fontSize=9, leading=11,
            textColor=NAVY),
        'tiger_body': ParagraphStyle('tiger_body',
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=DARK_TEXT),
    }

# ── Helper: navy pill badge ────────────────────────────────────────────────
class PillBadge(Flowable):
    def __init__(self, text, bg=NAVY, fg=WHITE, width=90, height=18):
        super().__init__()
        self.text = text
        self.bg = bg
        self.fg = fg
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        r = self.height / 2
        c.setFillColor(self.bg)
        c.roundRect(0, 0, self.width, self.height, r, fill=1, stroke=0)
        c.setFillColor(self.fg)
        c.setFont('Helvetica-Bold', 7.5)
        c.drawCentredString(self.width / 2, 5, self.text.upper())

# ── Helper: full-width navy banner ─────────────────────────────────────────
class NavyBanner(Flowable):
    def __init__(self, text, width=7.5*inch, height=28):
        super().__init__()
        self.text = text
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        c.setFillColor(NAVY)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(10, 8, self.text.upper())

# ── Helper: gold accent rule ───────────────────────────────────────────────
def gold_rule():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=2)

def light_rule():
    return HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=6, spaceBefore=6)

# ── Page template (header/footer) ─────────────────────────────────────────
def on_page(canvas, doc):
    W, H = letter
    margin = 0.65 * inch

    # Top bar
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, H - 0.55*inch, W, 0.55*inch, fill=1, stroke=0)

    canvas.setFillColor(WHITE)
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(margin, H - 0.34*inch, 'RR GOLF')

    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MID_GREY)
    canvas.drawRightString(W - margin, H - 0.34*inch, 'madriverpro.com')

    # Gold accent line under header
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.5)
    canvas.line(0, H - 0.55*inch, W, H - 0.55*inch)

    # Footer
    canvas.setFillColor(RULE)
    canvas.rect(0, 0, W, 0.45*inch, fill=1, stroke=0)
    canvas.setFillColor(MID_GREY)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawCentredString(W/2, 0.17*inch,
        f'Ryan Rinneard · Director of Instruction · Mad River Golf Club · Page {doc.page}')

    canvas.restoreState()


# ── BUILD ──────────────────────────────────────────────────────────────────
def build_pdf(output_path):
    S = styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=0.65*inch,
        rightMargin=0.65*inch,
        topMargin=0.85*inch,
        bottomMargin=0.65*inch,
    )
    story = []
    W = 7.2 * inch  # usable width

    # ── TITLE BLOCK ────────────────────────────────────────────────────────
    story.append(Spacer(1, 6))

    title_data = [[
        Paragraph('Session 1 — Coaching Plan', S['doc_title']),
        Paragraph('April 2026', S['meta'])
    ]]
    title_table = Table(title_data, colWidths=[5.2*inch, 2*inch])
    title_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(title_table)
    story.append(gold_rule())

    # Player meta row
    meta_data = [[
        Paragraph('<b>Sunny</b>', ParagraphStyle('mn', fontName='Helvetica-Bold',
            fontSize=11, textColor=NAVY)),
        Paragraph('Handicap: <b>8</b>', ParagraphStyle('mm', fontName='Helvetica',
            fontSize=9, textColor=DARK_TEXT)),
        Paragraph('Goal: <b>Scratch</b>', ParagraphStyle('mm', fontName='Helvetica',
            fontSize=9, textColor=DARK_TEXT)),
        Paragraph('Experience: <b>3–5 yrs</b>', ParagraphStyle('mm', fontName='Helvetica',
            fontSize=9, textColor=DARK_TEXT)),
        Paragraph('Coach: <b>Ryan Rinneard</b>', ParagraphStyle('mm', fontName='Helvetica',
            fontSize=9, textColor=DARK_TEXT, alignment=TA_RIGHT)),
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

    # ── PLAYER SNAPSHOT ────────────────────────────────────────────────────
    story.append(Paragraph('PLAYER SNAPSHOT', S['section_label']))
    story.append(Paragraph('Who Is Sunny?', S['section_title']))
    story.append(Paragraph(
        'Sunny is a 30–45 year old with 3–5 years in the game sitting at an 8 handicap — which is genuinely impressive '
        'for his time playing. He\'s self-aware, has had some coaching, and is actively working on swing changes. His goals '
        'are ambitious but realistic: scratch this year, consistent iron striking with the ability to shape both ways, and a '
        'controlled power fade off the tee. His ideal round — no OB, no blowup holes, pars all day — is already the mindset '
        'of a scratch player. The gap between where he is and where he wants to go is mostly about cleaning up his driver '
        'and eliminating the 3–5 avoidable errors that are costing him strokes every round.',
        S['body']))
    story.append(light_rule())

    # ── PRIORITY ORDER ─────────────────────────────────────────────────────
    story.append(Paragraph('PRIORITY ORDER', S['section_label']))
    story.append(Paragraph('Where Your Strokes Are', S['section_title']))
    story.append(Paragraph(
        'Based on your profile, here\'s where the scoring opportunity lives — ranked by impact.',
        S['body']))
    story.append(Spacer(1, 6))

    priorities = [
        ('1', 'Driver Accuracy', 'OB tee shots are your primary big-number trigger. At 30–50% fairways, you\'re starting too many holes behind. This is the #1 barrier to scratch.'),
        ('2', 'Routine Consistency', '"Sometimes" pre-shot and pre-putt routines across the board. At 8 hdcp, locking these in is what separates you from scratch — and fixes multiple areas at once.'),
        ('3', 'Putting Alignment', 'Consistent left miss + no reliable line = fixable in one session. Directly eliminates your 3-putt Tiger 5 leak.'),
        ('4', 'Toe Contact on Irons', 'Costs you GIRs and prevents the shot-shaping you want. Fix this and the fade/draw toolkit opens up naturally.'),
        ('5', 'Long Iron Confidence', '3/10 is a gap for a scratch-bound player. TrackMan session to build trust — or explore a driving iron replacement.'),
        ('6', 'Bunker Play', '5/10 is your only real short game weakness. A 20-minute setup correction will move this to 7/10 quickly.'),
    ]

    pri_rows = []
    row = []
    for i, (num, title, desc) in enumerate(priorities):
        cell = Table([[
            Paragraph(num, S['priority_num']),
        ],[
            Paragraph(title, S['priority_title']),
        ],[
            Paragraph(desc, S['priority_body']),
        ]], colWidths=[2.3*inch])
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
            pri_rows.append(row)
            row = []
    if row:
        while len(row) < 3:
            row.append(Paragraph('', S['body']))
        pri_rows.append(row)

    pri_table = Table(pri_rows, colWidths=[2.3*inch, 2.3*inch, 2.3*inch],
                      hAlign='LEFT')
    pri_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(pri_table)
    story.append(light_rule())

    # ── SESSION 1 PLAN ─────────────────────────────────────────────────────
    story.append(Paragraph('SESSION 1 COACHING PLAN', S['section_label']))
    story.append(Paragraph('Five Focus Areas', S['section_title']))
    story.append(Spacer(1, 4))

    focuses = [
        {
            'num': '01',
            'title': 'Driver — Face & Path Relationship',
            'why': 'Your previous coach addressed the steep/OTT pattern and you\'re working on it. The goal is a controlled power fade — slightly left path, slightly open face. TrackMan will give us exact numbers to target.',
            'drill': 'Gate Drill: Two headcovers framing an inside-out lane to prevent the over-the-top move.',
            'cue': '"Feel the club exit right of the target after impact."',
            'tag': 'LONG GAME',
        },
        {
            'num': '02',
            'title': 'Toe Contact on Irons',
            'why': 'Toe contact + left miss is a distance-from-ball or early extension issue. Impact tape on a 7-iron will tell us which one immediately. Fix this and your GIR improves and the fade/draw toolkit opens up.',
            'drill': 'Impact tape first, then alignment stick behind ball to train hip clearance through impact.',
            'cue': '"Trail hip moves away from the ball in the downswing — not toward it."',
            'tag': 'BALL STRIKING',
        },
        {
            'num': '03',
            'title': 'Pre-Shot Routine Lock-In',
            'why': 'You have one sometimes. You need one always. A locked-in routine eliminates the dwell-on-bad-shots pattern and improves execution across every single shot you hit.',
            'drill': 'Build the routine together: one look from behind, one feel cue, step in, one trigger to go. Practice on 10 shots including one uncomfortable shot (uneven lie or tight window).',
            'cue': '"Your routine is your anchor. It\'s the one thing you fully control on every shot."',
            'tag': 'MENTAL GAME',
        },
        {
            'num': '04',
            'title': 'Putting — Alignment & Start Line',
            'why': 'Consistent left miss + inconsistent routine = alignment problem. Most 8 hdcp players are shocked to see where their putter face is actually aimed. Fix the start line and your green reading improves automatically.',
            'drill': '3-ball gate drill: two tees just wider than putter head, 6 inches ahead of ball. Roll it through from 6 feet. 10 in a row. Focus is start line, not the make.',
            'cue': '"Start the ball where you\'re aiming. Everything else follows."',
            'tag': 'PUTTING',
        },
        {
            'num': '05',
            'title': 'Bunker Fundamentals',
            'why': '5/10 bunker confidence is almost always a setup issue — and it\'s fixable fast. Three successful splashes in a row and the confidence shifts.',
            'drill': 'Open face to sky, open stance 20–30°, ball forward, focus on a spot 2 inches behind the ball. Full committed swing.',
            'cue': '"You\'re not hitting the ball — you\'re splashing the sand. The sand moves the ball."',
            'tag': 'SHORT GAME',
        },
    ]

    for f in focuses:
        block = []

        # Header row: number + title + tag
        hdr = Table([[
            Paragraph(f['num'], ParagraphStyle('fn', fontName='Helvetica-Bold',
                fontSize=20, textColor=GOLD, leading=22)),
            Paragraph(f['title'], ParagraphStyle('ft', fontName='Helvetica-Bold',
                fontSize=12, textColor=NAVY, leading=15)),
            Paragraph(f['tag'], ParagraphStyle('ftag', fontName='Helvetica-Bold',
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

        # Why it matters
        block.append(Spacer(1, 4))
        block.append(Paragraph('<b>Why it matters for you</b>', S['body_bold']))
        block.append(Paragraph(f['why'], S['body']))

        # Drill
        drill_table = Table([[
            Paragraph('DRILL', ParagraphStyle('dl', fontName='Helvetica-Bold',
                fontSize=7, textColor=WHITE, leading=9)),
            Paragraph(f['drill'], ParagraphStyle('dt', fontName='Helvetica',
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

        # Cue
        block.append(Spacer(1, 3))
        cue_table = Table([[
            Paragraph('CUE', ParagraphStyle('cl', fontName='Helvetica-Bold',
                fontSize=7, textColor=GOLD, leading=9)),
            Paragraph(f['cue'], ParagraphStyle('ct', fontName='Helvetica-Oblique',
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

    # ── TIGER 5 SCORECARD ─────────────────────────────────────────────────
    story.append(Paragraph('TIGER 5 — COURSE MANAGEMENT SCORECARD', S['section_label']))
    story.append(Paragraph('Track Decisions, Not Score', S['section_title']))
    story.append(Paragraph(
        'Scott Fawcett (DECADE Golf) revealed that Tiger Woods used five personal rules to track avoidable errors during '
        'tournaments. Tiger\'s benchmark: <b>6 or fewer of these in 4 rounds</b> and he figured he\'d win. Here\'s how '
        'they map to your game right now.',
        S['body']))
    story.append(Spacer(1, 6))

    tiger5 = [
        ('#1', 'Bogey or worse on a par 5',
         'Par 5s are scoring holes. OB off the tee here = errant tee shot + blown opportunity.',
         '⚠ HIGH RISK'),
        ('#2', 'Big number (double bogey or worse)',
         'OB tee shots are your primary trigger. One double costs you two good holes to recover.',
         '⚠ HIGH RISK'),
        ('#3', 'Blown easy save from inside 15 yards',
         'Your short game is solid. Leaving chips short = deceleration. Commit through the shot.',
         '✓ MANAGEABLE'),
        ('#4', 'Three-putt',
         'Inconsistent routine + consistent left miss = preventable 3-putts every round.',
         '⚠ HIGH RISK'),
        ('#5', 'Bogey with 9-iron or shorter on approach',
         '7/10 wedge confidence is good. The issue is target selection — always play to the fat of the green.',
         '✓ MANAGEABLE'),
    ]

    tiger_rows = []
    for num, title, desc, risk in tiger5:
        risk_color = colors.HexColor('#C0392B') if 'HIGH' in risk else colors.HexColor('#27AE60')
        row = [
            Paragraph(num, ParagraphStyle('tn', fontName='Helvetica-Bold',
                fontSize=11, textColor=WHITE, alignment=TA_CENTER)),
            [Paragraph(title, S['tiger_title']),
             Paragraph(desc, S['tiger_body'])],
            Paragraph(risk.replace('⚠ ', '').replace('✓ ', ''),
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
    # Risk colours per row
    for i, (_, _, _, risk) in enumerate(tiger5):
        bg = colors.HexColor('#C0392B') if 'HIGH' in risk else colors.HexColor('#27AE60')
        ts.add('BACKGROUND', (2,i), (2,i), bg)
    tiger_table.setStyle(ts)
    story.append(tiger_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        '<b>Your assignment:</b> Track only these 5 in your next round. Not score — decisions. '
        'Bring the numbers to Session 2.',
        S['body']))
    story.append(light_rule())

    # ── ON-LESSON PROBES ──────────────────────────────────────────────────
    story.append(Paragraph('ON-LESSON OBSERVATIONS', S['section_label']))
    story.append(Paragraph('What to Watch For', S['section_title']))

    probes = [
        ('Grip', 'Check lead hand knuckles. Fade/slice with varying face contact suggests a weak grip. Even a small strengthening here can stabilize the face dramatically.'),
        ('Address Distance (Irons)', 'Toe contact = likely standing too close. Measure: fist\'s width between butt of club and lead thigh at address. If inside that, he\'s too close.'),
        ('Hip Mobility Through Transition', 'Previous coaching flagged reverse spine angle and steep transition. Watch whether hips clear properly or early extension is still present — affects both driver path and iron toe miss.'),
        ('"Dwelling" Behaviour', 'Ask directly: what does dwelling on a bad shot look like for him? Negative self-talk? Reactive grip/stance changes? Identify the specific pattern to prescribe a Vision54 reset cue.'),
        ('Long Iron — Technique or Avoidance?', 'Hit 5 long irons early with no pressure. Watch whether the miss is mechanical or whether his routine and body language change before he swings. Very different interventions.'),
        ('Warm-Up Routine', 'He reports "short" warm-ups. Ask what that actually looks like. Scratch performance requires consistent pre-round prep. If he\'s rolling up cold, that\'s a Tiger 5 risk on hole 1.'),
    ]

    for label, text in probes:
        probe_row = Table([[
            Paragraph('→', ParagraphStyle('arr', fontName='Helvetica-Bold',
                fontSize=11, textColor=GOLD)),
            [Paragraph(f'<b>{label}</b>', S['body_bold']),
             Paragraph(text, S['body'])],
        ]], colWidths=[0.3*inch, 6.9*inch])
        probe_row.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(probe_row)

    story.append(Spacer(1, 12))

    # ── CLOSING NOTE ──────────────────────────────────────────────────────
    closing = Table([[
        Paragraph(
            'Sunny has the mindset and the ball-striking foundation to reach scratch. '
            'The work is in the details — face control off the tee, a locked-in routine, and eliminating '
            'the 3–5 avoidable errors per round. Session 1 sets the blueprint.',
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
    build_pdf('/mnt/user-data/outputs/sunny_session1_plan.pdf')
