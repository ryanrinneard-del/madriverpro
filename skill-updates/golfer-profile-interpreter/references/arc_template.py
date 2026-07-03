from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, KeepTogether, PageBreak)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Flowable

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

# ── Page template ─────────────────────────────────────────────────────────
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
    d = base[name]
    d.update(kw)
    return ParagraphStyle(name, **d)

def gold_rule():
    return HRFlowable(width='100%', thickness=1.5, color=GOLD, spaceAfter=8, spaceBefore=2)

def light_rule():
    return HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=8, spaceBefore=6)

def section_header(label, title, story):
    story.append(Paragraph(label, S('section_label')))
    story.append(Paragraph(title, S('section_title')))

# ── DATA ───────────────────────────────────────────────────────────────────
sessions = [
    {
        'week': '1',
        'theme': 'Diagnose & Lock In the Foundation',
        'subtitle': 'Session 1 of 6 — Assessment + Fundamentals',
        'primary': 'Driver face/path — TrackMan baseline, gate drill, shape the fade',
        'secondary': 'Toe contact on irons — impact tape, hip clearance drill',
        'practice': [
            'Gate drill: 20 driver swings daily, focus on exit direction',
            'Impact tape on 7-iron: 15 swings, check contact location',
            'Pre-shot routine: write it down, commit to using it every swing on the range',
        ],
        'tiger5': 'Track all 5 events in one round. No pressure to fix — just observe and record.',
        'ready_when': 'Fairway contact improving. Can describe the feel of the correct exit path.',
        'measure': 'Fairways hit, Tiger 5 count from one round',
    },
    {
        'week': '2',
        'theme': 'Routine Under Pressure',
        'subtitle': 'Session 2 of 6 — Mental Game + Putting',
        'primary': 'Pre-shot and pre-putt routine — lock it in, pressure-test it',
        'secondary': 'Putting alignment + start line gate drill',
        'practice': [
            'Pre-putt routine: every putt on the practice green uses the full routine — no exceptions',
            'Gate drill from 6 feet: 10 in a row before finishing each putting practice',
            'On course: count how many shots you execute the full routine vs. shortcut it',
        ],
        'tiger5': 'Focus on Tiger 5 #4 (3-putts) and #5 (bogey with scoring club). Track those two specifically.',
        'ready_when': 'Routine feels automatic on range. Left miss on putts reducing.',
        'measure': '3-putts per round, putts from inside 6 feet make %',
    },
    {
        'week': '3',
        'theme': 'Iron Precision',
        'subtitle': 'Session 3 of 6 — Ball Striking + Distance Gapping',
        'primary': 'TrackMan gap session — dial in exact carry distances for every club',
        'secondary': 'Shot shaping introduction — the controlled fade with mid-irons',
        'practice': [
            'Write down your 10 carry distances and keep them in your bag or phone',
            'On the range: hit 5 shots to a specific yardage target with each iron, note dispersion',
            'Course: commit to a specific yardage target on every approach — not just a club',
        ],
        'tiger5': 'Focus on Tiger 5 #5 (bogey with scoring club). You should be hitting the green — now confirm the yardage is the reason when you miss.',
        'ready_when': 'Can recite carry distances with confidence. Toe miss largely eliminated.',
        'measure': 'GIR per round (target: 7+ from current 4–6)',
    },
    {
        'week': '4',
        'theme': 'Short Game Sharpening',
        'subtitle': 'Session 4 of 6 — Chipping + Bunkers',
        'primary': 'Bunker technique — setup, shallow entry, acceleration, commitment',
        'secondary': 'Chipping distance control — landing zone targeting, eliminate the short chip',
        'practice': [
            'Bunker: 20 practice splashes per session — open face, spot 2 inches behind ball',
            'Chipping: pick a landing spot (not the hole) on every chip. Land it there.',
            'Tiger 5 #3: get up and down from every easy lie inside 15 yards — track it',
        ],
        'tiger5': 'Tiger 5 #3 is the focus this week. Every blown easy save gets noted.',
        'ready_when': 'Bunker confidence at 7/10+. Chips landing within 3 feet of chosen spot consistently.',
        'measure': 'Up-and-down % from easy lies, bunker saves per round',
    },
    {
        'week': '5',
        'theme': 'On-Course Integration',
        'subtitle': 'Session 5 of 6 — Playing Lesson or On-Course Session',
        'primary': 'Play 9 holes together — observe routine, decision-making, recovery from bad shots',
        'secondary': 'Course management: par 5 strategy, miss direction awareness, pin vs. fat of green',
        'practice': [
            'Play one full round with full Tiger 5 tracking — all 5 events',
            'Before each tee shot: name the miss and aim away from the trouble',
            'After any bad shot: use the reset cue (breath + feel feet) before the next shot',
        ],
        'tiger5': 'Full Tiger 5 tracking round. Bring the scorecard to Session 6.',
        'ready_when': 'Tiger 5 count under 8 per round. Routine holding under pressure.',
        'measure': 'Full Tiger 5 scorecard, overall score vs. baseline',
    },
    {
        'week': '6',
        'theme': 'Reassess & Set the Next Arc',
        'subtitle': 'Session 6 of 6 — Measurement + Planning',
        'primary': 'TrackMan re-baseline — compare driver and iron data to Session 1',
        'secondary': 'Review Tiger 5 trend, GIR trend, putts per round trend',
        'practice': [
            'Continue all routines — they are now permanent habits, not practice assignments',
            'Identify the one area that still needs the most work',
            'Book the next arc — or graduate to match play / competitive prep',
        ],
        'tiger5': 'Review the full 6-week Tiger 5 trend. Where did you improve most? Where is the remaining leak?',
        'ready_when': 'Handicap trending toward single digits. Tiger 5 average under 6 per round.',
        'measure': 'Handicap index, Tiger 5 average, GIR average, putts per round vs. Session 1 baseline',
    },
]

progress_markers = [
    ('Fairways Hit', '30–50%', '55–65%', 'Controlled fade, no OB'),
    ('GIR per Round', '4–6', '7–9', 'Improved contact + distance gapping'),
    ('Putts per Round', 'Unknown', '30 or fewer', 'Routine + start line fix'),
    ('3-Putts per Round', 'Frequent', '1 or fewer', 'Distance control + alignment'),
    ('Tiger 5 Count', 'Unknown baseline', '6 or fewer', 'Decision quality improving'),
    ('Bunker Saves', '5/10 confidence', '7/10+', 'Setup and commitment fix'),
]

practice_principles = [
    ('Purpose over Repetition',
     'Every range session needs a goal. "Hit balls" is not a session. Pick one thing, measure it, stop when you\'ve got it.'),
    ('Routine on Every Shot',
     'The range is where you train the routine, not just the swing. If you wouldn\'t skip it on the course, don\'t skip it here.'),
    ('Quality over Quantity',
     '30 focused swings beats 150 mindless ones. When you stop feeling the target, stop hitting.'),
    ('Transfer to the Course',
     'The skills you build here only count if they show up in your scorecard. One Tiger 5 tracking round per week minimum.'),
]

# ── BUILD ──────────────────────────────────────────────────────────────────
def build_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.85*inch, bottomMargin=0.65*inch,
    )
    story = []

    # ── TITLE BLOCK ────────────────────────────────────────────────────────
    story.append(Spacer(1, 6))
    hdr = Table([[
        Paragraph('6-Week Coaching Arc', S('doc_title')),
        Paragraph('April – May 2026', S('meta', alignment=TA_RIGHT)),
    ]], colWidths=[5.2*inch, 2.0*inch])
    hdr.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'BOTTOM'),
                              ('ALIGN',(1,0),(1,0),'RIGHT')]))
    story.append(hdr)
    story.append(gold_rule())

    meta = Table([[
        Paragraph('<b>Sunny</b>', S('body_bold', fontSize=11, textColor=NAVY)),
        Paragraph('Start Handicap: <b>8</b>',   S('small')),
        Paragraph('Target: <b>Scratch</b>',      S('small')),
        Paragraph('Sessions: <b>6 × 60 min</b>', S('small')),
        Paragraph('Coach: <b>Ryan Rinneard</b>', S('small', alignment=TA_RIGHT)),
    ]], colWidths=[1.5*inch,1.3*inch,1.2*inch,1.4*inch,1.8*inch])
    meta.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),LIGHT_BG),
        ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
        ('LEFTPADDING',(0,0),(0,-1),10),('RIGHTPADDING',(-1,0),(-1,-1),10),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ]))
    story.append(meta)
    story.append(Spacer(1, 14))

    # ── ARC OVERVIEW ───────────────────────────────────────────────────────
    section_header('THE PLAN', 'What We\'re Building Over 6 Weeks', story)
    story.append(Paragraph(
        'You\'re 8 shots away from scratch with 3–5 years in the game. That\'s genuinely rare. '
        'The foundation is already there — consistent iron play, solid short game, a scoring mindset. '
        'What\'s leaking strokes is a handful of very specific, very fixable things: an unreliable '
        'driver, inconsistent routines, and the 3–5 avoidable errors per round that separate an 8 '
        'from a scratch. This arc is about closing that gap systematically — not overhauling your '
        'game, but sharpening the edges of what\'s already working.',
        S('body')))

    # Three themes
    themes = [
        ('Theme 1', 'Technical Precision', 'Driver shape, iron contact, distance gapping — build the reliable ball-striking that scratch demands.'),
        ('Theme 2', 'Routine & Mental Game', 'Lock in a pre-shot and pre-putt routine that holds under pressure and stops the dwell pattern.'),
        ('Theme 3', 'Course Management', 'Tiger 5 tracking, par 5 strategy, miss direction awareness — score with the swing you already have.'),
    ]
    theme_rows = [[
        Table([[
            Paragraph(t[0], S('section_label', spaceBefore=0)),
            Paragraph(t[1], S('body_bold', spaceAfter=2)),
            Paragraph(t[2], S('small')),
        ]], colWidths=[2.2*inch])
        for t in themes
    ]]
    theme_table = Table(theme_rows, colWidths=[2.2*inch, 2.2*inch, 2.2*inch], hAlign='LEFT')
    theme_table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),10),
        ('RIGHTPADDING',(0,0),(-1,-1),10),
        ('TOPPADDING',(0,0),(-1,-1),10),
        ('BOTTOMPADDING',(0,0),(-1,-1),10),
        ('BACKGROUND',(0,0),(-1,-1),LIGHT_BG),
        ('LINEABOVE',(0,0),(0,-1),2,GOLD),
        ('LINEABOVE',(1,0),(1,-1),2,NAVY_MID),
        ('LINEABOVE',(2,0),(2,-1),2,NAVY_LIGHT),
        ('LEFTPADDING',(1,0),(1,-1),16),
        ('LEFTPADDING',(2,0),(2,-1),16),
    ]))
    story.append(theme_table)
    story.append(light_rule())

    # ── SESSION-BY-SESSION ─────────────────────────────────────────────────
    section_header('THE SESSIONS', 'Week-by-Week Breakdown', story)
    story.append(Spacer(1, 4))

    for sess in sessions:
        block = []

        # Week header bar
        wk_hdr = Table([[
            Paragraph(sess['week'], S('week_num')),
            [Paragraph(sess['theme'], S('week_theme')),
             Paragraph(sess['subtitle'], S('week_sub'))],
        ]], colWidths=[0.65*inch, 6.55*inch])
        wk_hdr.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(0,0),NAVY),
            ('BACKGROUND',(1,0),(1,0),LIGHT_BG),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
            ('TOPPADDING',(0,0),(-1,-1),8),
            ('BOTTOMPADDING',(0,0),(-1,-1),8),
            ('LEFTPADDING',(1,0),(1,0),12),
            ('LINEABOVE',(0,0),(-1,0),2,GOLD),
        ]))
        block.append(wk_hdr)
        block.append(Spacer(1, 6))

        # Primary + Secondary focus
        focus_data = [[
            [Paragraph('PRIMARY FOCUS', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess['primary'], S('small'))],
            [Paragraph('SECONDARY FOCUS', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess['secondary'], S('small'))],
        ]]
        focus_table = Table(focus_data, colWidths=[3.55*inch, 3.55*inch])
        focus_table.setStyle(TableStyle([
            ('VALIGN',(0,0),(-1,-1),'TOP'),
            ('LEFTPADDING',(0,0),(-1,-1),0),
            ('RIGHTPADDING',(0,0),(0,-1),12),
            ('TOPPADDING',(0,0),(-1,-1),0),
        ]))
        block.append(focus_table)
        block.append(Spacer(1, 8))

        # Practice assignments
        block.append(Paragraph('BETWEEN-SESSION PRACTICE', S('section_label', spaceBefore=0, spaceAfter=4)))
        for p in sess['practice']:
            row = Table([[
                Paragraph('◆', ParagraphStyle('dot', fontName='Helvetica-Bold',
                    fontSize=7, textColor=GOLD, leading=12)),
                Paragraph(p, S('small')),
            ]], colWidths=[0.2*inch, 7.0*inch])
            row.setStyle(TableStyle([
                ('VALIGN',(0,0),(-1,-1),'TOP'),
                ('TOPPADDING',(0,0),(-1,-1),1),
                ('BOTTOMPADDING',(0,0),(-1,-1),2),
                ('LEFTPADDING',(0,0),(-1,-1),0),
            ]))
            block.append(row)

        block.append(Spacer(1, 6))

        # Tiger 5 + Ready When + Measure row
        bottom_data = [[
            [Paragraph('TIGER 5 FOCUS', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess['tiger5'], S('small'))],
            [Paragraph('READY TO PROGRESS WHEN', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess['ready_when'], S('small', textColor=GREEN_OK))],
            [Paragraph('MEASURE', S('section_label', spaceBefore=0, spaceAfter=2)),
             Paragraph(sess['measure'], S('small'))],
        ]]
        bottom_table = Table(bottom_data, colWidths=[2.8*inch, 2.4*inch, 2.0*inch])
        bottom_table.setStyle(TableStyle([
            ('VALIGN',(0,0),(-1,-1),'TOP'),
            ('LEFTPADDING',(0,0),(-1,-1),8),
            ('RIGHTPADDING',(0,0),(-1,-1),6),
            ('TOPPADDING',(0,0),(-1,-1),7),
            ('BOTTOMPADDING',(0,0),(-1,-1),7),
            ('BACKGROUND',(0,0),(0,-1),LIGHT_BG),
            ('BACKGROUND',(1,0),(1,-1),colors.HexColor('#EEF7F1')),
            ('BACKGROUND',(2,0),(2,-1),LIGHT_BG),
        ]))
        block.append(bottom_table)
        block.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                 spaceAfter=12, spaceBefore=8))

        story.append(KeepTogether(block))

    # ── PROGRESS MARKERS ───────────────────────────────────────────────────
    story.append(PageBreak())
    section_header('MEASURING PROGRESS', 'What Success Looks Like', story)
    story.append(Paragraph(
        'These are the numbers we\'re moving. Track them after every round and bring them to each session.',
        S('body')))
    story.append(Spacer(1, 6))

    # Header row
    pm_header = [
        Paragraph('METRIC', S('section_label', spaceBefore=0)),
        Paragraph('NOW', S('section_label', spaceBefore=0)),
        Paragraph('TARGET (6 WKS)', S('section_label', spaceBefore=0)),
        Paragraph('WHY IT MATTERS', S('section_label', spaceBefore=0)),
    ]
    pm_rows = [pm_header]
    for metric, now, target, why in progress_markers:
        pm_rows.append([
            Paragraph(metric, S('small_bold')),
            Paragraph(now,    S('small', textColor=RED_RISK)),
            Paragraph(target, S('small', textColor=GREEN_OK)),
            Paragraph(why,    S('small')),
        ])

    pm_table = Table(pm_rows, colWidths=[1.6*inch, 1.1*inch, 1.4*inch, 3.1*inch])
    pm_ts = TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),
        ('TEXTCOLOR',(0,0),(-1,0),WHITE),
        ('TOPPADDING',(0,0),(-1,-1),7),
        ('BOTTOMPADDING',(0,0),(-1,-1),7),
        ('LEFTPADDING',(0,0),(-1,-1),8),
        ('RIGHTPADDING',(0,0),(-1,-1),8),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE, LIGHT_BG]),
        ('LINEBELOW',(0,0),(-1,-1),0.5,RULE),
    ])
    pm_table.setStyle(pm_ts)
    story.append(pm_table)
    story.append(light_rule())

    # ── PRACTICE PRINCIPLES ────────────────────────────────────────────────
    section_header('PRACTICE PRINCIPLES', 'How to Get the Most Out of the Work', story)
    story.append(Spacer(1, 4))

    pp_rows = [[
        Table([[
            Paragraph(f'0{i+1}', S('section_label', spaceBefore=0, spaceAfter=2, textColor=NAVY_LIGHT)),
            Paragraph(pp[0], S('body_bold', spaceAfter=2)),
            Paragraph(pp[1], S('small')),
        ]], colWidths=[3.45*inch])
        for i, pp in enumerate(practice_principles[:2])
    ],[
        Table([[
            Paragraph(f'0{i+3}', S('section_label', spaceBefore=0, spaceAfter=2, textColor=NAVY_LIGHT)),
            Paragraph(pp[0], S('body_bold', spaceAfter=2)),
            Paragraph(pp[1], S('small')),
        ]], colWidths=[3.45*inch])
        for i, pp in enumerate(practice_principles[2:])
    ]]

    pp_table = Table(pp_rows, colWidths=[3.55*inch, 3.55*inch])
    pp_table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),10),
        ('RIGHTPADDING',(0,0),(-1,-1),10),
        ('TOPPADDING',(0,0),(-1,-1),10),
        ('BOTTOMPADDING',(0,0),(-1,-1),10),
        ('BACKGROUND',(0,0),(-1,-1),LIGHT_BG),
        ('LINEABOVE',(0,0),(0,-1),1.5,GOLD),
        ('LINEABOVE',(1,0),(1,-1),1.5,GOLD),
        ('RIGHTPADDING',(0,0),(0,-1),20),
        ('ROWPADDING',(0,0),(-1,-1),6),
    ]))
    story.append(pp_table)
    story.append(light_rule())

    # ── TIGER 5 TRACKING CARD ─────────────────────────────────────────────
    section_header('TIGER 5 TRACKING', 'Your Mental Scorecard — Every Round', story)
    story.append(Paragraph(
        'After every round, record how many times each of these happened. '
        'You\'re not tracking score — you\'re tracking <b>decision quality</b>. '
        'Bring this to every session.',
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
        Paragraph('EVENT', S('section_label', spaceBefore=0)),
        Paragraph('WK 1', S('section_label', spaceBefore=0)),
        Paragraph('WK 2', S('section_label', spaceBefore=0)),
        Paragraph('WK 3', S('section_label', spaceBefore=0)),
        Paragraph('WK 4', S('section_label', spaceBefore=0)),
        Paragraph('WK 5', S('section_label', spaceBefore=0)),
        Paragraph('WK 6', S('section_label', spaceBefore=0)),
    ]
    t5_rows = [t5_header]
    for num, event in t5_items:
        t5_rows.append([
            Paragraph(num, S('small_bold', textColor=GOLD)),
            Paragraph(event, S('small')),
            Paragraph('', S('small')),
            Paragraph('', S('small')),
            Paragraph('', S('small')),
            Paragraph('', S('small')),
            Paragraph('', S('small')),
            Paragraph('', S('small')),
        ])
    # Total row
    t5_rows.append([
        Paragraph('', S('small')),
        Paragraph('<b>TOTAL (target: ≤ 6)</b>', S('small_bold')),
        Paragraph('', S('small')),
        Paragraph('', S('small')),
        Paragraph('', S('small')),
        Paragraph('', S('small')),
        Paragraph('', S('small')),
        Paragraph('', S('small')),
    ])

    t5_table = Table(t5_rows,
        colWidths=[0.4*inch, 2.8*inch, 0.65*inch, 0.65*inch, 0.65*inch, 0.65*inch, 0.65*inch, 0.65*inch])
    t5_ts = TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),
        ('TEXTCOLOR',(0,0),(-1,0),WHITE),
        ('TOPPADDING',(0,0),(-1,-1),7),
        ('BOTTOMPADDING',(0,0),(-1,-1),7),
        ('LEFTPADDING',(0,0),(-1,-1),6),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('ROWBACKGROUNDS',(0,1),(-1,-2),[WHITE, LIGHT_BG]),
        ('BACKGROUND',(0,-1),(-1,-1),colors.HexColor('#EEF0F5')),
        ('LINEBELOW',(0,0),(-1,-1),0.5,RULE),
        ('ALIGN',(2,0),(-1,-1),'CENTER'),
        ('LINEAFTER',(1,1),(1,-1),0.5,RULE),
    ])
    t5_table.setStyle(t5_ts)
    story.append(t5_table)
    story.append(light_rule())

    # ── COMMITMENT CLOSE ──────────────────────────────────────────────────
    section_header('THE COMMITMENT', 'A Note From Your Coach', story)
    story.append(Spacer(1, 4))

    closing_text = (
        'Scratch is not a swing overhaul. For you, it\'s a handful of specific fixes applied with '
        'consistency and intention. You already have the ball-striking to get there — the iron play '
        'is real, the short game is real, and the mindset you described (pars all day, no blowups) '
        'is exactly right. My job over these six weeks is to give you the tools, the data, and the '
        'framework to make it happen. Your job is to show up with the tracking numbers, trust the '
        'process between sessions, and compete with yourself — not your scorecard. '
        'Let\'s go get it.'
    )

    close_block = Table([[
        Paragraph(closing_text, S('italic', fontSize=10, leading=16, textColor=NAVY_MID)),
    ]], colWidths=[W])
    close_block.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),LIGHT_BG),
        ('TOPPADDING',(0,0),(-1,-1),14),
        ('BOTTOMPADDING',(0,0),(-1,-1),14),
        ('LEFTPADDING',(0,0),(-1,-1),16),
        ('RIGHTPADDING',(0,0),(-1,-1),16),
        ('LINEABOVE',(0,0),(-1,0),2,GOLD),
    ]))
    story.append(close_block)
    story.append(Spacer(1, 10))

    sig = Table([[
        Paragraph('<b>Ryan Rinneard</b>', S('body_bold', textColor=NAVY)),
        Paragraph('CPGA Class A · TrackMan · TPI G3 · Vision54',
            S('meta', alignment=TA_RIGHT)),
    ]], colWidths=[3.0*inch, 4.2*inch])
    sig.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    story.append(sig)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF created: {output_path}')


if __name__ == '__main__':
    build_pdf('/mnt/user-data/outputs/sunny_6week_arc.pdf')
