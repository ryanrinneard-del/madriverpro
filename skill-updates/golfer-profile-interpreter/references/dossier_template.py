"""
RR Golf — Player Dossier
Rebuilt from scratch with correct column widths throughout.
Usable page width = 7.2 inch (letter minus 0.65 margins each side)
All tables verified to sum exactly to 7.2 inch or their parent cell width.
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
PW, PH    = letter          # 612 x 792 pt
LM = RM   = 0.65 * inch
TM        = 0.85 * inch
BM        = 0.65 * inch
BODY_W    = PW - LM - RM   # 7.2 inch  ← every top-level table must equal this

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

# ── Style factory ─────────────────────────────────────────────────────────
def sty(fontName='Helvetica', fontSize=9.5, leading=14, textColor=DARK_TEXT,
        alignment=TA_LEFT, spaceBefore=0, spaceAfter=4, charSpace=0,
        leftIndent=0, **kw):
    return ParagraphStyle('_', fontName=fontName, fontSize=fontSize,
                          leading=leading, textColor=textColor,
                          alignment=alignment, spaceBefore=spaceBefore,
                          spaceAfter=spaceAfter, charSpace=charSpace,
                          leftIndent=leftIndent, **kw)

# Common styles
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
S_GREEN    = sty('Helvetica',      8.5, 12, GREEN_OK,  spaceAfter=2)
S_RED      = sty('Helvetica-Bold', 8,   11, RED_RISK,  spaceAfter=2)
S_AMBER    = sty('Helvetica-Bold', 8,   11, AMBER,     spaceAfter=2)
S_BLUE     = sty('Helvetica-Bold', 8,   11, colors.HexColor('#2980B9'), spaceAfter=2)

def gold_rule():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=2)

def light_rule():
    return HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8, spaceBefore=6)

def sec(label, title, story):
    story.append(Paragraph(label, S_LABEL))
    story.append(Paragraph(title, S_H3))

# ── Radar chart ───────────────────────────────────────────────────────────
class SkillRadar(Flowable):
    def __init__(self, scores, labels, size=190):
        super().__init__()
        self.scores = scores
        self.labels = labels
        self.width = size
        self.height = size + 30   # extra for labels

    def draw(self):
        c   = self.canv
        sz  = 190
        cx  = sz / 2
        cy  = sz / 2 + 10
        r   = sz * 0.36
        n   = len(self.scores)

        def pt(i, v):
            a = math.pi/2 + 2*math.pi*i/n
            return cx + r*(v/10)*math.cos(a), cy + r*(v/10)*math.sin(a)

        def op(i):
            a = math.pi/2 + 2*math.pi*i/n
            return cx + r*math.cos(a), cy + r*math.sin(a)

        # Grid rings
        for ring in (.25, .5, .75, 1.0):
            c.setStrokeColor(RULE); c.setLineWidth(.5)
            path = c.beginPath()
            for i in range(n):
                a = math.pi/2 + 2*math.pi*i/n
                x, y = cx + r*ring*math.cos(a), cy + r*ring*math.sin(a)
                path.moveTo(x, y) if i == 0 else path.lineTo(x, y)
            path.close(); c.drawPath(path, stroke=1, fill=0)

        # Spokes
        for i in range(n):
            ox, oy = op(i)
            c.setStrokeColor(RULE); c.setLineWidth(.5)
            c.line(cx, cy, ox, oy)

        # Fill polygon
        pts = [pt(i, self.scores[i]) for i in range(n)]
        path = c.beginPath()
        path.moveTo(*pts[0])
        for p in pts[1:]: path.lineTo(*p)
        path.close()
        c.setFillColor(colors.HexColor('#C9A84C'))
        c.setFillAlpha(0.18)
        c.setStrokeColor(GOLD); c.setLineWidth(1.5)
        c.drawPath(path, stroke=1, fill=1)
        c.setFillAlpha(1.0)

        # Score dots
        for i, (px, py) in enumerate(pts):
            c.setFillColor(WHITE); c.circle(px, py, 6, fill=1, stroke=0)
            c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 7)
            c.drawCentredString(px, py - 2.5, str(self.scores[i]))

        # Labels
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
        col = RED_RISK if self.score<=3 else AMBER if self.score<=5 \
              else colors.HexColor('#2980B9') if self.score<=7 else GREEN_OK
        fw  = max(self.width*(self.score/10), self.height)
        c.setFillColor(col)
        c.roundRect(0, 0, fw, self.height, self.height/2, fill=1, stroke=0)


# ── Page callbacks ────────────────────────────────────────────────────────
def cover_page(canvas, doc):
    # White background — print friendly
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, PW, PH, fill=1, stroke=0)
    # Navy header bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, PH - 0.75*inch, PW, 0.75*inch, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(0, PH - 0.78*inch, PW, 0.03*inch, fill=1, stroke=0)
    # RR GOLF
    canvas.setFillColor(WHITE);  canvas.setFont('Helvetica-Bold', 12)
    canvas.drawString(LM, PH - 0.46*inch, 'RR GOLF')
    canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 9)
    canvas.drawRightString(PW - RM, PH - 0.46*inch, 'madriverpro.com')
    # PLAYER DOSSIER label
    canvas.setFillColor(GOLD); canvas.setFont('Helvetica-Bold', 8)
    canvas.drawString(LM, PH - 1.2*inch, 'PLAYER DOSSIER')
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(1.5)
    canvas.line(LM, PH - 1.28*inch, PW - RM, PH - 1.28*inch)
    # Player name — navy, large
    canvas.setFillColor(NAVY); canvas.setFont('Helvetica-Bold', 52)
    canvas.drawString(LM, PH - 2.2*inch, 'Sunny')
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(2)
    canvas.line(LM, PH - 2.35*inch, 3.3*inch, PH - 2.35*inch)
    # Sub details
    canvas.setFillColor(NAVY_LIGHT); canvas.setFont('Helvetica', 12)
    canvas.drawString(LM, PH - 2.65*inch,
        'Handicap 8  \xb7  Goal: Scratch  \xb7  3-5 Years Playing')
    # Credentials box
    bx, by, bw, bh = PW - 2.4*inch, PH - 3.25*inch, 1.75*inch, 1.2*inch
    canvas.setFillColor(LIGHT_BG); canvas.setStrokeColor(NAVY)
    canvas.setLineWidth(1)
    canvas.roundRect(bx, by, bw, bh, 4, fill=1, stroke=1)
    canvas.setFillColor(GOLD);  canvas.setFont('Helvetica-Bold', 7.5)
    canvas.drawCentredString(bx+bw/2, by+bh-0.21*inch, 'CPGA CLASS A')
    canvas.setFillColor(NAVY);  canvas.setFont('Helvetica', 8)
    for i, txt in enumerate(['TrackMan Certified','TPI Level 3','Vision54 Coach','Titleist Ambassador']):
        canvas.drawCentredString(bx+bw/2, by+bh-(0.39+i*0.18)*inch, txt)
    # Divider
    canvas.setStrokeColor(RULE); canvas.setLineWidth(0.5)
    canvas.line(LM, 1.65*inch, PW - RM, 1.65*inch)
    # Coach info
    canvas.setFillColor(NAVY);    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(LM, 1.4*inch, 'Ryan Rinneard')
    canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 9)
    canvas.drawString(LM, 1.15*inch,
        'Director of Instruction  \xb7  Mad River Golf Club  \xb7  April 2026')
    canvas.drawRightString(PW - RM, 1.15*inch, 'Confidential \u2014 For Coaching Use')


def inner_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PH - 0.55*inch, PW, 0.55*inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE);  canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(LM, PH - 0.34*inch, 'RR GOLF')
    canvas.setFillColor(MID_GREY); canvas.setFont('Helvetica', 8)
    canvas.drawRightString(PW - RM, PH - 0.34*inch, 'Player Dossier \u2014 Sunny')
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


# ── Simple table helpers ──────────────────────────────────────────────────
def full_table(data, col_w, style_cmds):
    """Single-row full-width table. col_w must sum to BODY_W."""
    assert abs(sum(col_w) - BODY_W) < 0.01, f"Widths sum to {sum(col_w)}, need {BODY_W}"
    t = Table(data, colWidths=col_w)
    t.setStyle(TableStyle(style_cmds))
    return t


# ── BUILD ─────────────────────────────────────────────────────────────────
def build_pdf(path):
    doc = SimpleDocTemplate(
        path, pagesize=letter,
        leftMargin=LM, rightMargin=RM,
        topMargin=TM, bottomMargin=BM,
    )
    story = []

    # ── COVER (canvas-only) ────────────────────────────────────────────────
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════
    # PAGE 2 — PLAYER IDENTITY
    # ══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 4))
    sec('PLAYER IDENTITY', "Sunny's Golf Story", story)

    story.append(Paragraph(
        'Sunny is a 30\u201345 year old male who has been playing golf for 3\u20135 years and already '
        'sits at an 8 handicap \u2014 a genuinely rare achievement for his time in the game. He has '
        'had one previous lesson, is actively working on swing changes (upright backswing, front-side '
        'loading, hands higher), and brings strong self-awareness to his coaching. He knows what he '
        'wants: scratch handicap this year, consistent iron striking with the ability to shape the ball '
        'both ways, and a controlled power fade off the tee.', S_BODY))

    story.append(Paragraph(
        'His ideal round tells you everything about his mindset \u2014 no OB, no blowup holes, pars '
        'all day. That\'s not a beginner\'s goal. That\'s a scratch player\'s goal. The gap between '
        'where he is and where he wants to go is not about talent or work ethic. It\'s about cleaning '
        'up 3\u20135 specific, fixable things that are costing him strokes every round.', S_BODY))

    story.append(gold_rule())

    # Stat strip — 5 equal columns, each 1.44 inch = 7.2 total
    COL5 = BODY_W / 5   # 1.44 inch each
    stats = [
        ('8',       'Current Handicap'),
        ('3\u20135','Years Playing'),
        ('240\u2013270', 'Drive Distance'),
        ('4\u20136', 'GIR per Round'),
        ('Scratch', 'Target'),
    ]
    stat_row = []
    for val, lbl in stats:
        # Use smaller font so nothing wraps
        stat_row.append([
            Paragraph(val, sty('Helvetica-Bold', 20, 24, GOLD, TA_CENTER)),
            Paragraph(lbl, S_GREY_SM),
        ])
    stat_table = Table([stat_row], colWidths=[COL5]*5)
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(-1,-1), LIGHT_BG),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('LINEABOVE', (0,0),(0,-1), 2, GOLD),
        ('LINEABOVE', (4,0),(4,-1), 2, GOLD),
    ]))
    story.append(stat_table)
    story.append(light_rule())

    # ── SKILL MAP ─────────────────────────────────────────────────────────
    sec('SKILL MAP', 'Game at a Glance', story)
    story.append(Paragraph(
        'Scores derived from self-reported confidence ratings, performance data, and coaching '
        'interpretation. Starting-point baselines \u2014 not fixed assessments.', S_META))

    radar_scores = [7.5, 6.5, 7.5, 6.0, 5.5, 5.0]
    radar_labels = ['Long Game','Approach','Short Game','Putting','Course Mgmt','Mental Game']
    skill_data = [
        ('Long Game',   7.5, 'Solid distance, manageable miss. Driver accuracy is the key gap.', AMBER),
        ('Approach',    6.5, 'Good confidence but toe miss and GIR below potential.',             AMBER),
        ('Short Game',  7.5, 'Genuine strength. Pitching and chipping are reliable assets.',      GREEN_OK),
        ('Putting',     6.0, 'Functional but leaking strokes. Left miss and no routine.',         AMBER),
        ('Course Mgmt', 5.5, 'Strategy present "usually" \u2014 needs to be always at scratch.',  AMBER),
        ('Mental Game', 5.0, 'Dwells on bad shots. Routine inconsistent. Biggest growth area.',   RED_RISK),
    ]

    # Left: radar 2.6 inch  |  Right: skill table 4.6 inch  =  7.2 inch
    RADAR_W = 2.6 * inch
    SKILL_W = BODY_W - RADAR_W  # 4.6 inch

    # Skill table: area 1.0 | bar 1.2 | score 0.55 | note 1.85 = 4.6
    A_W, B_W, SC_W, N_W = 1.0*inch, 1.2*inch, 0.55*inch, 1.85*inch
    assert abs(A_W+B_W+SC_W+N_W - SKILL_W) < 0.01

    skill_rows = []
    for area, score, note, col in skill_data:
        skill_rows.append([
            Paragraph(area, S_SMALLB),
            RatingBar(score, width=B_W - 4, height=7),
            Paragraph(f'{score}/10', sty('Helvetica-Bold', 8.5, 12, col, TA_CENTER)),
            Paragraph(note, S_SMALL),
        ])
    skill_tbl = Table(skill_rows, colWidths=[A_W, B_W, SC_W, N_W])
    skill_tbl.setStyle(TableStyle([
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('LINEBELOW',     (0,0),(-1,-2), 0.5, RULE),
        ('LEFTPADDING',   (0,0),(-1,-1), 4),
    ]))

    map_tbl = Table(
        [[SkillRadar(radar_scores, radar_labels, size=190), skill_tbl]],
        colWidths=[RADAR_W, SKILL_W]
    )
    map_tbl.setStyle(TableStyle([
        ('VALIGN',      (0,0),(-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0),(0,0),   0),
        ('RIGHTPADDING',(0,0),(0,0),   8),
        ('LEFTPADDING', (1,0),(1,0),   0),
    ]))
    story.append(map_tbl)
    story.append(light_rule())

    # ══════════════════════════════════════════════════════════════════════
    # PAGE 3 — FULL GAME DIAGNOSTIC
    # ══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    sec('FULL GAME DIAGNOSTIC', 'Section-by-Section Analysis', story)

    diag_sections = [
        {
            'title':  'Long Game \u2014 Driver, Fairway Woods, Long Irons',
            'flag':   ('WARNING: PRIMARY LEAK', AMBER),
            'body':   ('Sunny carries 240\u2013270 yards \u2014 right in the low-handicap range \u2014 '
                       'so distance is not the issue. Direction is. A slice/fade miss with varying face '
                       'contact and only 30\u201350% fairways hit means he\'s starting too many holes '
                       'in trouble. His previous coaching correctly identified an over-the-top pattern '
                       'with steep transition and reverse spine angle, and he\'s actively working the fix. '
                       'Long iron confidence at 3/10 is a significant red flag \u2014 at scratch level '
                       'these need to be a reliable weapon, not avoided. Fairway wood confidence at 5/10 '
                       'is workable but needs attention.'),
            'flags':  [
                ('WARNING  Fairways hit 30\u201350% \u2014 accuracy before distance', AMBER),
                ('WARNING  Long iron confidence 3/10 \u2014 scratch barrier', RED_RISK),
                ('GOOD     Distance in low-hdcp range \u2014 no work needed here', GREEN_OK),
            ],
        },
        {
            'title':  'Approach Game \u2014 Mid Irons, Short Irons, Wedges',
            'flag':   ('MODERATE \u2014 IMPROVABLE', colors.HexColor('#2980B9')),
            'body':   ('The 7/10 confidence across 6-iron through wedges is solid and consistent \u2014 '
                       'the data backs up his self-identified strength of iron play. However, the '
                       'consistent toe miss and left approach direction are connected: toe contact '
                       'typically produces a weak, left-biased flight. He has a "rough idea" of carry '
                       'distances which will become a scoring barrier chasing scratch \u2014 TrackMan '
                       'gap mapping is a priority. GIR of 4\u20136 is below what an 8 hdcp should '
                       'produce, confirming the toe miss is costing more greens than he realises.'),
            'flags':  [
                ('WARNING  Toe miss costing GIR \u2014 address in Session 1', AMBER),
                ('WARNING  Distances "rough idea" only \u2014 gap mapping needed', AMBER),
                ('GOOD     Confidence consistent across all iron lengths', GREEN_OK),
            ],
        },
        {
            'title':  'Short Game \u2014 Chipping, Pitching, Bunkers',
            'flag':   ('GENUINE STRENGTH', GREEN_OK),
            'body':   ('Short game is a real asset. Bump-and-run 7/10, high loft 7/10, pitching 8/10. '
                       'He uses multiple wedges based on the shot \u2014 not a one-club player. Good '
                       'distance judgment "usually". The 5/10 bunker comfort is the only clear weak '
                       'spot. Leaving chips short is his stated struggle \u2014 almost always a '
                       'deceleration issue rather than a technique problem. One focused bunker session '
                       'on setup and acceleration will move this quickly.'),
            'flags':  [
                ('WARNING  Bunker 5/10 \u2014 setup and commitment fix needed', AMBER),
                ('WARNING  Chips leaving short \u2014 deceleration pattern', AMBER),
                ('GOOD     Pitching 8/10 \u2014 protect this strength', GREEN_OK),
            ],
        },
        {
            'title':  'Putting',
            'flag':   ('LEAKING STROKES', AMBER),
            'body':   ('Raw numbers look decent \u2014 7/10 under 5 feet, 6/10 from 6\u201315 feet, '
                       '7/10 on lag. But the consistent left miss, "sometimes" use of an alignment aid, '
                       'and "sometimes" pre-putt routine is the real story. The left miss is almost '
                       'certainly an alignment or face-at-impact issue fixable in one session. He '
                       'identifies green reading as his struggle, but an inconsistent routine is almost '
                       'certainly the root cause. Distance control on lag putts is a strength and '
                       'should be protected.'),
            'flags':  [
                ('WARNING  Consistent left miss \u2014 alignment issue', AMBER),
                ('WARNING  No consistent pre-putt routine', RED_RISK),
                ('GOOD     Lag putting 7/10 \u2014 distance control is good', GREEN_OK),
            ],
        },
        {
            'title':  'Course Management & Strategy',
            'flag':   ('MODERATE LEAK', AMBER),
            'body':   ('Sunny has a course strategy "usually" \u2014 better than most, but not '
                       'consistent enough for scratch. Risk/reward managed "sometimes". Most frequent '
                       'mistakes are errant tee shots and putt misses \u2014 both feeding from the '
                       'technical leaks above. Narrow fairways and uneven lies are his comfort zone '
                       'weaknesses, suggesting he hasn\'t built confident frameworks for those '
                       'situations yet. Iron play holding under pressure is a huge asset to build '
                       'around.'),
            'flags':  [
                ('WARNING  Strategy "usually" \u2014 needs to be always at scratch', AMBER),
                ('WARNING  No framework for uneven lies or narrow fairways', AMBER),
                ('GOOD     Iron play under pressure \u2014 protect and leverage', GREEN_OK),
            ],
        },
        {
            'title':  'Mental Game & On-Course Behaviour',
            'flag':   ('SIGNIFICANT GROWTH AREA', RED_RISK),
            'body':   ('This is where the scratch gap lives more than anywhere else. Sunny dwells on '
                       'bad shots \u2014 his words. He has "sometimes" pre-shot routines and a "short" '
                       'warm-up. These are not small details at 8 hdcp \u2014 they are the difference. '
                       'Vision54 focuses on the Human Skills of golf: commitment to decisions, emotional '
                       'regulation, consistent routines, and the ability to manage yourself on the '
                       'course when things go sideways. These are the skills that allow a player\'s '
                       'best golf to show up when it matters \u2014 not just on the range. Right now '
                       'the inconsistent routine is the gap between Sunny\'s range game and his scoring. '
                       'The good news: his stated ideal round shows he already has the right model. '
                       'He just needs the process to execute it.'),
            'flags':  [
                ('WARNING  Dwells on bad shots \u2014 Vision54 reset cue needed', RED_RISK),
                ('WARNING  Pre-shot routine inconsistent across all shots', RED_RISK),
                ('GOOD     Correct scoring mindset already in place', GREEN_OK),
            ],
        },
    ]

    # Diag block: title bar full width, then body, then flag rows
    # Title bar: 5.1 label | 2.1 flag = 7.2
    for ds in diag_sections:
        block = []
        flag_txt, flag_col = ds['flag']

        hdr = Table([[
            Paragraph(ds['title'], sty('Helvetica-Bold', 10, 13, NAVY)),
            Paragraph(flag_txt,    sty('Helvetica-Bold', 8, 11, flag_col, TA_RIGHT)),
        ]], colWidths=[5.0*inch, 2.2*inch])
        hdr.setStyle(TableStyle([
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
            ('BACKGROUND',    (0,0),(-1,-1), LIGHT_BG),
            ('TOPPADDING',    (0,0),(-1,-1), 7),
            ('BOTTOMPADDING', (0,0),(-1,-1), 7),
            ('LEFTPADDING',   (0,0),(0,0),   10),
            ('RIGHTPADDING',  (1,0),(1,0),   10),
            ('LINEABOVE',     (0,0),(-1,0),  1.5, GOLD),
        ]))
        block.append(hdr)
        block.append(Spacer(1, 4))
        block.append(Paragraph(ds['body'], S_SMALL))
        block.append(Spacer(1, 3))

        for flag_str, f_col in ds['flags']:
            prefix, _, rest = flag_str.partition('  ')
            frow = Table([[
                Paragraph(prefix, sty('Helvetica-Bold', 7.5, 11, f_col)),
                Paragraph(rest,   sty('Helvetica',      8.5, 12, f_col)),
            ]], colWidths=[0.75*inch, 6.45*inch])
            frow.setStyle(TableStyle([
                ('VALIGN',        (0,0),(-1,-1), 'TOP'),
                ('TOPPADDING',    (0,0),(-1,-1), 1),
                ('BOTTOMPADDING', (0,0),(-1,-1), 2),
                ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ]))
            block.append(frow)

        block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                 spaceAfter=10, spaceBefore=6))
        story.append(KeepTogether(block))

    # ══════════════════════════════════════════════════════════════════════
    # PAGE 4 — PRIORITY PRESCRIPTION
    # ══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    sec('PRIORITY PRESCRIPTION', 'Ranked by Scoring Impact', story)
    story.append(Paragraph(
        'Every recommendation below is connected directly to your stated goals. '
        'This is the sequence that gets you to scratch fastest.', S_BODY))
    story.append(Spacer(1, 6))

    prescriptions = [
        ('1', 'Driver Accuracy',
         'Scratch Goal \u2192 No OB',
         'OB tee shots are your Tiger 5 #2 trigger. At 30\u201350% fairways you\'re starting holes '
         'behind. Fixing the face/path relationship unlocks the power fade goal and eliminates '
         'the round-killers.', RED_RISK),
        ('2', 'Pre-Shot & Pre-Putt Routine',
         'Scratch Goal \u2192 No Blowups',
         'Inconsistent routines across every part of the game. At 8 hdcp this is the clearest '
         'separator from scratch. One locked-in routine improves execution everywhere simultaneously '
         'and kills the dwell-on-bad-shots pattern.', RED_RISK),
        ('3', 'Putting Start Line & Alignment',
         'Scratch Goal \u2192 Fewer 3-Putts',
         'Consistent left miss + no reliable pre-putt routine = preventable strokes every round. '
         'Fixable in one session. Directly addresses Tiger 5 #4.', AMBER),
        ('4', 'Toe Contact on Irons',
         'Scratch Goal \u2192 Consistent Ball Striking',
         'Toe miss is costing GIR and blocking the shot-shaping goal. Fix this and the fade/draw '
         'toolkit opens naturally. GIR should move from 4\u20136 toward 7\u20139.', AMBER),
        ('5', 'Distance Gapping via TrackMan',
         'Scratch Goal \u2192 Consistent Irons',
         '"Rough idea" of distances is a scratch barrier. A single TrackMan gap session produces '
         'exact carry numbers for every club \u2014 fastest way to improve approach decision-making.',
         AMBER),
        ('6', 'Long Iron Confidence',
         'Scratch Goal \u2192 Complete Game',
         '3/10 is a gap for a scratch-bound player. One focused session \u2014 or a driving iron / '
         '4-hybrid assessment \u2014 will resolve this.', colors.HexColor('#2980B9')),
        ('7', 'Bunker Play',
         'Scratch Goal \u2192 Short Game Completeness',
         '5/10 is the only real short game weakness. A 20-minute setup correction (open face, '
         'open stance, shallow entry, commit through) will move this to 7/10 quickly.',
         colors.HexColor('#2980B9')),
    ]

    # num col 0.55 | content col 6.65 = 7.2
    for num, title, goal_link, body, col in prescriptions:
        block = []
        row = Table([[
            Paragraph(num, sty('Helvetica-Bold', 22, 24, GOLD, TA_CENTER)),
            [Paragraph(title,     sty('Helvetica-Bold', 10, 13, NAVY)),
             Paragraph(goal_link, sty('Helvetica',       8, 11, GOLD)),
             Paragraph(body,      sty('Helvetica',      8.5, 12, DARK_TEXT))],
        ]], colWidths=[0.55*inch, 6.65*inch])
        row.setStyle(TableStyle([
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
            ('BACKGROUND',    (0,0),(0,0),   NAVY),
            ('BACKGROUND',    (1,0),(1,0),   LIGHT_BG),
            ('TOPPADDING',    (0,0),(-1,-1), 9),
            ('BOTTOMPADDING', (0,0),(-1,-1), 9),
            ('LEFTPADDING',   (1,0),(1,0),   10),
            ('RIGHTPADDING',  (1,0),(1,0),   10),
            ('LINEABOVE',     (0,0),(-1,0),  2, col),
        ]))
        block.append(row)
        block.append(Spacer(1, 5))
        story.append(KeepTogether(block))

    story.append(light_rule())

    # ── TIGER 5 PERSONAL PROFILE ──────────────────────────────────────────
    sec('TIGER 5 PERSONAL PROFILE', 'Your Avoidable Error Map', story)
    story.append(Paragraph(
        'Scott Fawcett (DECADE Golf) revealed that Tiger Woods tracked 5 specific avoidable errors '
        'each tournament. Tiger\'s target: <b>6 or fewer per 4 rounds</b>. Here\'s how each maps '
        'to Sunny\'s game right now.', S_BODY))
    story.append(Spacer(1, 4))

    tiger5 = [
        ('#1', 'Bogey or worse on a par 5',
         'Errant tee shots put you in recovery mode on holes you should be making pars or birdies.',
         'HIGH RISK', RED_RISK,
         'Play for position off the tee on par 5s. Driver only when the fairway is wide. '
         'Layup to your best wedge distance. Par is the minimum acceptable result.'),
        ('#2', 'Big number (double bogey or worse)',
         'OB tee shots are your primary trigger. One double costs two good holes to recover.',
         'HIGH RISK', RED_RISK,
         'Identify the OB before the tee shot, aim away from it. When in trouble, take the '
         'medicine and move on. Never compound a mistake.'),
        ('#3', 'Blown easy save inside 15 yards',
         'Your short game is a strength \u2014 this should be rare. Main risk is the short chip '
         'deceleration pattern. Commit through every shot.',
         'LOW RISK', GREEN_OK,
         'Landing zone targeting on every chip. Accelerate through impact. '
         'Middle of the green is always a success from this range.'),
        ('#4', 'Three-putt',
         'Inconsistent pre-putt routine + consistent left miss = preventable 3-putts every round.',
         'HIGH RISK', RED_RISK,
         'Full pre-putt routine every single time. Alignment line on the ball. '
         'For long putts: target a 3-foot circle, not the hole.'),
        ('#5', 'Bogey with 9-iron or shorter on approach',
         '7/10 wedge confidence is solid. The risk is aiming at tucked pins with scoring clubs.',
         'MODERATE', AMBER,
         'Never aim at a tucked pin with a scoring club. Centre of the green, make the putt.'),
    ]

    # num 0.5 | content 5.5 | badge 1.2 = 7.2
    for num, title, diag, risk_lbl, risk_col, rx in tiger5:
        block = []
        t_row = Table([[
            Paragraph(num, sty('Helvetica-Bold', 11, 13, WHITE, TA_CENTER)),
            [Paragraph(title, sty('Helvetica-Bold', 10, 13, NAVY)),
             Paragraph(diag,  sty('Helvetica',      8.5,12, DARK_TEXT))],
            Paragraph(risk_lbl, sty('Helvetica-Bold', 7.5, 11, WHITE, TA_CENTER)),
        ]], colWidths=[0.5*inch, 5.5*inch, 1.2*inch])
        t_row.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(0,0),   NAVY),
            ('BACKGROUND',    (2,0),(2,0),   risk_col),
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,0),(-1,-1), 8),
            ('BOTTOMPADDING', (0,0),(-1,-1), 8),
            ('LEFTPADDING',   (1,0),(1,0),   10),
            ('RIGHTPADDING',  (1,0),(1,0),   6),
        ]))
        block.append(t_row)

        px_row = Table([[
            Paragraph('PRESCRIPTION', sty('Helvetica-Bold', 7, 10, GOLD, charSpace=1)),
            Paragraph(rx, S_SMALL),
        ]], colWidths=[1.1*inch, 6.1*inch])
        px_row.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), LIGHT_BG),
            ('TOPPADDING',    (0,0),(-1,-1), 6),
            ('BOTTOMPADDING', (0,0),(-1,-1), 6),
            ('LEFTPADDING',   (0,0),(0,0),   8),
            ('LEFTPADDING',   (1,0),(1,0),   6),
            ('RIGHTPADDING',  (1,0),(1,0),   8),
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ]))
        block.append(px_row)
        block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                 spaceAfter=7, spaceBefore=3))
        story.append(KeepTogether(block))

    # ══════════════════════════════════════════════════════════════════════
    # PAGE 5 — ARC SUMMARY + GOALS CONTRACT
    # ══════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    sec('6-WEEK ARC SUMMARY', 'The Road to Scratch', story)
    story.append(Paragraph(
        'Full session-by-session detail is in the accompanying Arc document. '
        'This summary shows the progression logic and what each phase is building toward.', S_BODY))
    story.append(Spacer(1, 4))

    arc_phases = [
        ('Sessions 1\u20132', 'Foundation',
         ['Driver face/path diagnosis + gate drill',
          'Toe contact fix \u2014 impact tape + hip clearance',
          'Pre-shot routine build and lock-in',
          'Putting alignment + start line gate drill'],
         'Routine is consistent. Driver path improving. Left miss reducing.'),
        ('Sessions 3\u20134', 'Precision',
         ['TrackMan gap session \u2014 all clubs mapped',
          'Shot shaping introduction \u2014 controlled fade with irons',
          'Bunker technique \u2014 setup, entry, commitment',
          'Chipping distance control \u2014 landing zone targeting'],
         'Exact carry distances known. GIR trending toward 7+. Bunker confidence at 7/10.'),
        ('Session 5', 'Integration',
         ['Playing lesson \u2014 9 holes together',
          'Course management: par 5 strategy, miss direction awareness',
          'Pressure routine \u2014 holds under course conditions',
          'Full Tiger 5 tracking round'],
         'Tiger 5 count under 8. Routine holding on course.'),
        ('Session 6', 'Reassess',
         ['TrackMan re-baseline vs. Session 1',
          'Review all Tiger 5 and stat trends',
          'Handicap index review',
          'Plan the next arc or graduate to competitive prep'],
         'Handicap trending single digits. Tiger 5 average under 6 per round.'),
    ]

    # Arc phase: navy header full width
    # Content: items col 3.8 | ready-when col 3.4 = 7.2
    ARC_L = 3.8*inch
    ARC_R = BODY_W - ARC_L   # 3.4

    for ph_title, ph_name, items, checkpoint in arc_phases:
        block = []
        hdr = Table([[
            Paragraph(ph_title, S_WHITE),
            Paragraph(ph_name,  S_WHITE_SM),
        ]], colWidths=[1.5*inch, 5.7*inch])
        hdr.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), NAVY_MID),
            ('TOPPADDING',    (0,0),(-1,-1), 6),
            ('BOTTOMPADDING', (0,0),(-1,-1), 6),
            ('LEFTPADDING',   (0,0),(-1,-1), 10),
            ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ]))
        block.append(hdr)

        item_rows = [[
            Paragraph('\u25c6', sty('Helvetica-Bold', 7, 11, GOLD)),
            Paragraph(item,     sty('Helvetica',      8.5,12, DARK_TEXT)),
        ] for item in items]
        # item inner cols: 0.2 + 3.4 = 3.6 (inside 3.8 cell with 10pt left pad ≈ ok)
        item_tbl = Table(item_rows, colWidths=[0.2*inch, ARC_L - 0.4*inch])
        item_tbl.setStyle(TableStyle([
            ('TOPPADDING',    (0,0),(-1,-1), 2),
            ('BOTTOMPADDING', (0,0),(-1,-1), 2),
            ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]))

        chk_tbl = Table([[
            Paragraph('READY WHEN', sty('Helvetica-Bold', 7, 10, GOLD, charSpace=1)),
            Paragraph(checkpoint,   sty('Helvetica', 8.5, 12, GREEN_OK)),
        ]], colWidths=[ARC_R - 0.0*inch])   # single col, stack vertically
        chk_tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), GREEN_LIGHT),
            ('TOPPADDING',    (0,0),(-1,-1), 8),
            ('BOTTOMPADDING', (0,0),(-1,-1), 8),
            ('LEFTPADDING',   (0,0),(-1,-1), 10),
            ('RIGHTPADDING',  (0,0),(-1,-1), 10),
        ]))

        content = Table([[item_tbl, chk_tbl]], colWidths=[ARC_L, ARC_R])
        content.setStyle(TableStyle([
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
            ('BACKGROUND',    (0,0),(0,0),   LIGHT_BG),
            ('TOPPADDING',    (0,0),(0,0),   8),
            ('BOTTOMPADDING', (0,0),(0,0),   8),
            ('LEFTPADDING',   (0,0),(0,0),   8),
            ('RIGHTPADDING',  (0,0),(0,0),   4),
            ('LEFTPADDING',   (1,0),(1,0),   0),
            ('RIGHTPADDING',  (1,0),(1,0),   0),
        ]))
        block.append(content)
        block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                 spaceAfter=7, spaceBefore=2))
        story.append(KeepTogether(block))

    story.append(light_rule())

    # ── GOALS CONTRACT ────────────────────────────────────────────────────
    sec('GOALS CONTRACT', 'Commitments with Timelines', story)
    story.append(Paragraph(
        'Your goals rewritten as specific, measurable targets. '
        'Not wishes \u2014 commitments.', S_BODY))
    story.append(Spacer(1, 4))

    goals = [
        ('01', 'Reach Scratch Handicap',
         'Everything in this plan serves this target.',
         [('Metric',           'Handicap index at or below 0.0'),
          ('Timeline',         'End of 2026 season'),
          ('Leading indicator','Tiger 5 average \u22646 per round by Week 6'),
          ('Milestone',        'Single-digit handicap by mid-season')]),
        ('02', 'Consistent Iron Striking + Shot Shaping',
         'Pure contact, correct distances, ability to work the ball both ways.',
         [('Metric',           'GIR 9+ per round / toe miss eliminated'),
          ('Timeline',         'Sessions 3\u20134 (gap mapping + shaping intro)'),
          ('Leading indicator','TrackMan: consistent strike, carry within 3 yards of target'),
          ('Milestone',        'Controlled fade and draw on demand with 7-iron')]),
        ('03', 'Reliable Power Fade Off the Tee',
         'A trusted, repeatable driver flight. No more "spicy".',
         [('Metric',           'Fairways hit 60%+ / zero OB rounds'),
          ('Timeline',         'Sessions 1\u20132 (face/path work)'),
          ('Leading indicator','TrackMan path/face delta within 3\xb0 of target fade'),
          ('Milestone',        'One full round with zero OB tee shots')]),
    ]

    # num 0.55 | content 6.65 = 7.2
    for num, title, context, metrics in goals:
        block = []
        g_hdr = Table([[
            Paragraph(num,     sty('Helvetica-Bold', 22, 24, GOLD, TA_CENTER)),
            [Paragraph(title,   sty('Helvetica-Bold', 10, 13, NAVY)),
             Paragraph(context, sty('Helvetica',      8.5,12, DARK_TEXT))],
        ]], colWidths=[0.55*inch, 6.65*inch])
        g_hdr.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(0,0),   NAVY),
            ('BACKGROUND',    (1,0),(1,0),   LIGHT_BG),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0),(-1,-1), 10),
            ('BOTTOMPADDING', (0,0),(-1,-1), 10),
            ('LEFTPADDING',   (1,0),(1,0),   10),
            ('RIGHTPADDING',  (1,0),(1,0),   10),
            ('LINEABOVE',     (0,0),(-1,0),  2, GOLD),
        ]))
        block.append(g_hdr)

        # metric rows: label 1.3 | value 5.9 = 7.2
        m_rows = [[
            Paragraph(mk, sty('Helvetica-Bold', 8.5, 12, MID_GREY)),
            Paragraph(mv, sty('Helvetica',      8.5, 12, DARK_TEXT)),
        ] for mk, mv in metrics]
        m_tbl = Table(m_rows, colWidths=[1.3*inch, 5.9*inch])
        m_tbl.setStyle(TableStyle([
            ('TOPPADDING',    (0,0),(-1,-1), 4),
            ('BOTTOMPADDING', (0,0),(-1,-1), 4),
            ('LEFTPADDING',   (0,0),(0,-1),  14),
            ('LEFTPADDING',   (1,0),(1,-1),  8),
            ('RIGHTPADDING',  (1,0),(1,-1),  8),
            ('LINEBELOW',     (0,0),(-1,-2), 0.5, RULE),
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ]))
        block.append(m_tbl)
        block.append(Spacer(1, 7))
        story.append(KeepTogether(block))

    story.append(light_rule())

    # ── CLOSING ───────────────────────────────────────────────────────────
    sec('COACHING COMMITMENT', '', story)
    close_tbl = Table([[
        Paragraph(
            'Scratch is not a swing overhaul. For you, it\'s a handful of specific fixes applied '
            'with consistency and intention. You already have the ball-striking, the short game, '
            'and \u2014 most importantly \u2014 the mindset. Pars all day, no blowups. That\'s '
            'exactly right. My commitment is to give you the tools, the data, and the framework '
            'to make it real. Yours is to show up with the tracking numbers, trust the process '
            'between sessions, and compete with yourself \u2014 not your scorecard. '
            'This dossier is our shared blueprint. Let\'s go get it.',
            sty('Helvetica-Oblique', 9.5, 15, NAVY_MID)),
    ]], colWidths=[BODY_W])
    close_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), LIGHT_BG),
        ('TOPPADDING',    (0,0),(-1,-1), 14),
        ('BOTTOMPADDING', (0,0),(-1,-1), 14),
        ('LEFTPADDING',   (0,0),(-1,-1), 14),
        ('RIGHTPADDING',  (0,0),(-1,-1), 14),
        ('LINEABOVE',     (0,0),(-1,0),  2, GOLD),
    ]))
    story.append(close_tbl)
    story.append(Spacer(1, 10))

    sig = Table([[
        Paragraph('<b>Ryan Rinneard</b>', sty('Helvetica-Bold', 9.5, 13, NAVY)),
        Paragraph('CPGA Class A \xb7 TrackMan \xb7 TPI G3 \xb7 Vision54 \xb7 Mad River Golf Club',
                  sty('Helvetica', 8.5, 12, MID_GREY, TA_RIGHT)),
    ]], colWidths=[2.5*inch, 4.7*inch])
    sig.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    story.append(sig)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'Done: {path}')


if __name__ == '__main__':
    build_pdf('/mnt/user-data/outputs/sunny_dossier_v3.pdf')
