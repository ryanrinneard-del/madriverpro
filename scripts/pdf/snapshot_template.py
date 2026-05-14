"""
RR Golf — Player Game Plan (Snapshot Style)

A 2-page player-facing report rendered from the structured payload produced by
the Golfer Profile Interpreter (see /api/_lib/schema.js).

Page 1 — The Snapshot: "Your Game at a Glance" status rows, the three callouts
(#1 Priority / Your Strength / The Goal Line), and the mandatory Setup Read.
Page 2 — The Plan: three Session 1 focus cards, Ryan's on-lesson checklist, and
a closing line.

Usage:
    from snapshot_template import build_pdf
    build_pdf('/tmp/out.pdf', data)   # data is the analysis.json payload

Running the module standalone with no data uses scripts/pdf/_sample_data.py.

Design notes:
- The Snapshot is plain-language by design. Nothing in here should contain
  method names, framework labels, or coaching jargon — the interpreter strips
  that out upstream, and this template never adds any.
- `snapshot_callouts` and `setup_read` are optional in the schema. When they're
  absent the template derives sensible fallbacks so it always renders cleanly.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, HRFlowable, KeepTogether, Flowable)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ── Brand colours ──────────────────────────────────────────────────────────
NAVY       = colors.HexColor('#0A1628')
NAVY_MID   = colors.HexColor('#1A2E4A')
GOLD       = colors.HexColor('#C9A84C')
WHITE      = colors.white
LIGHT_BG   = colors.HexColor('#F7F8FA')
CALLOUT_BG = colors.HexColor('#F4F6F9')
MID_GREY   = colors.HexColor('#8A9BB0')
DARK_TEXT  = colors.HexColor('#1A1A2E')
BODY_TEXT  = colors.HexColor('#33414F')
RULE       = colors.HexColor('#DDE3EC')

DOT_RED   = colors.HexColor('#C0392B')
DOT_AMBER = colors.HexColor('#D9A441')
DOT_GREEN = colors.HexColor('#2E9E5B')
DOT_NAVY  = colors.HexColor('#1A2E4A')

PAGE_W, PAGE_H = letter
MARGIN_L = 0.85 * inch
MARGIN_R = 0.85 * inch
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R


# ── Status helpers ─────────────────────────────────────────────────────────
def _dot_color(level):
    """Map a schema status level to a 3-colour status dot."""
    lvl = (level or '').upper()
    if lvl == 'RED':
        return DOT_RED
    if lvl == 'AMBER':
        return DOT_AMBER
    if lvl in ('GREEN', 'BLUE'):
        return DOT_GREEN
    return DOT_AMBER


class Dot(Flowable):
    """A small filled status circle."""
    def __init__(self, color, radius=4.2):
        super().__init__()
        self.color = color
        self.radius = radius
        self.width = radius * 2
        self.height = radius * 2

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.circle(self.radius, self.radius, self.radius, stroke=0, fill=1)


# ── Paragraph styles ───────────────────────────────────────────────────────
def styles():
    return {
        'doc_title': ParagraphStyle(
            'doc_title', fontName='Helvetica-Bold', fontSize=26, leading=30,
            textColor=NAVY, spaceAfter=0),
        'doc_meta': ParagraphStyle(
            'doc_meta', fontName='Helvetica', fontSize=10, leading=13,
            textColor=MID_GREY, alignment=TA_RIGHT),
        'strip_name': ParagraphStyle(
            'strip_name', fontName='Helvetica-Bold', fontSize=12, leading=15,
            textColor=NAVY),
        'strip_fact': ParagraphStyle(
            'strip_fact', fontName='Helvetica', fontSize=9.5, leading=13,
            textColor=BODY_TEXT),
        'eyebrow': ParagraphStyle(
            'eyebrow', fontName='Helvetica-Bold', fontSize=7.5, leading=11,
            textColor=GOLD, spaceBefore=9, spaceAfter=3),
        'section_title': ParagraphStyle(
            'section_title', fontName='Helvetica-Bold', fontSize=16, leading=20,
            textColor=NAVY, spaceAfter=4),
        'glance_area': ParagraphStyle(
            'glance_area', fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=NAVY),
        'glance_read': ParagraphStyle(
            'glance_read', fontName='Helvetica', fontSize=9.5, leading=13,
            textColor=BODY_TEXT),
        'callout_label': ParagraphStyle(
            'callout_label', fontName='Helvetica-Bold', fontSize=7.5, leading=10,
            textColor=MID_GREY),
        'callout_body': ParagraphStyle(
            'callout_body', fontName='Helvetica', fontSize=10, leading=14,
            textColor=DARK_TEXT),
        'card_num': ParagraphStyle(
            'card_num', fontName='Helvetica-Bold', fontSize=20, leading=22,
            textColor=GOLD),
        'card_title': ParagraphStyle(
            'card_title', fontName='Helvetica-Bold', fontSize=14, leading=17,
            textColor=NAVY),
        'card_tag': ParagraphStyle(
            'card_tag', fontName='Helvetica-Bold', fontSize=7, leading=9,
            textColor=WHITE, alignment=TA_CENTER),
        'card_why': ParagraphStyle(
            'card_why', fontName='Helvetica', fontSize=9.5, leading=13.5,
            textColor=BODY_TEXT, spaceBefore=2, spaceAfter=2),
        'mini_label': ParagraphStyle(
            'mini_label', fontName='Helvetica-Bold', fontSize=7, leading=9,
            textColor=GOLD),
        'mini_label_navy': ParagraphStyle(
            'mini_label_navy', fontName='Helvetica-Bold', fontSize=7, leading=9,
            textColor=WHITE, alignment=TA_CENTER),
        'cue_text': ParagraphStyle(
            'cue_text', fontName='Helvetica-Oblique', fontSize=9.5, leading=13,
            textColor=DARK_TEXT),
        'drill_text': ParagraphStyle(
            'drill_text', fontName='Helvetica', fontSize=9.5, leading=13,
            textColor=BODY_TEXT),
        'note_label': ParagraphStyle(
            'note_label', fontName='Helvetica-Bold', fontSize=9.5, leading=13,
            textColor=NAVY),
        'note_text': ParagraphStyle(
            'note_text', fontName='Helvetica', fontSize=9, leading=12.5,
            textColor=BODY_TEXT),
        'arrow': ParagraphStyle(
            'arrow', fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=GOLD),
        'closing': ParagraphStyle(
            'closing', fontName='Helvetica-Oblique', fontSize=10, leading=15,
            textColor=DARK_TEXT),
    }


# ── Data derivation (graceful fallbacks for optional schema fields) ─────────
def _student(data):
    return data.get('student') or {}


def _priority(data):
    """The #1 priority callout — authored field, else first priority."""
    co = data.get('snapshot_callouts') or {}
    if co.get('priority'):
        return co['priority']
    pris = data.get('priorities') or []
    if pris:
        p = pris[0]
        return '<b>%s.</b> %s' % (p.get('title', ''), p.get('desc', ''))
    return 'We set the season priority together in Session 1.'


def _strength(data):
    """The strength callout — authored field, else the strongest skill area."""
    co = data.get('snapshot_callouts') or {}
    if co.get('strength'):
        return co['strength']
    notes = data.get('skill_notes') or []
    if notes:
        best = max(notes, key=lambda n: n.get('score', 0))
        return '<b>%s.</b> %s' % (best.get('area', ''), best.get('note', ''))
    return 'We identify the skill to build around in Session 1.'


def _goal_line(data):
    """The goal-line callout — authored field, else the Session 1 closing note."""
    co = data.get('snapshot_callouts') or {}
    if co.get('goal_line'):
        return co['goal_line']
    if data.get('session1_closing'):
        return data['session1_closing']
    goal = _student(data).get('goal')
    if goal:
        return 'Your goal: %s. The plan below is the route there.' % goal
    return 'The plan below is built around your stated goal.'


def _closing_line(data):
    """The bottom-of-page-2 closing line."""
    co = data.get('snapshot_callouts') or {}
    if co.get('closing_line'):
        return co['closing_line']
    return data.get('session1_closing') or 'Let’s get to work.'


def _glance_rows(data):
    """Five 'Your Game at a Glance' rows derived from skill_notes.

    skill_notes carries six areas in a fixed order; the Snapshot shows five,
    with Course Mgmt presented to the player as 'Strategy'.
    """
    notes = data.get('skill_notes') or []
    label_map = {'Course Mgmt': 'Strategy', 'Course Management': 'Strategy'}
    rows = []
    for n in notes[:5]:
        area = n.get('area', '')
        rows.append({
            'area': label_map.get(area, area),
            'read': n.get('note', ''),
            'color': _dot_color(n.get('level')),
        })
    return rows


def _setup_read(data):
    """Three setup checkpoints. Uses the authored setup_read field when present,
    otherwise renders the three checkpoints with a neutral 'confirm on the tee'
    read so the section — which is mandatory — always appears."""
    sr = data.get('setup_read') or []
    if sr:
        return [{
            'area': c.get('area', ''),
            'read': c.get('note', ''),
            'color': _dot_color(c.get('level')),
        } for c in sr[:3]]
    default_note = 'We read this on the lesson tee before any swing change.'
    return [
        {'area': 'Grip', 'read': default_note, 'color': DOT_AMBER},
        {'area': 'Posture & Stance', 'read': default_note, 'color': DOT_AMBER},
        {'area': 'Aim & Ball Position', 'read': default_note, 'color': DOT_AMBER},
    ]


def _focuses(data):
    """Up to three Session 1 focus cards."""
    return (data.get('focuses') or [])[:3]


def _probes(data):
    """Ryan's on-lesson checklist."""
    return data.get('probes') or []


# ── Layout builders ────────────────────────────────────────────────────────
def _header_footer(canvas, doc):
    canvas.saveState()
    # Top navy band
    band_h = 0.46 * inch
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - band_h, PAGE_W, band_h, stroke=0, fill=1)
    # Gold rule under the band
    canvas.setFillColor(GOLD)
    canvas.rect(0, PAGE_H - band_h - 2.2, PAGE_W, 2.2, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont('Helvetica-Bold', 11)
    canvas.drawString(MARGIN_L, PAGE_H - band_h + 0.155 * inch, 'RR GOLF')
    canvas.setFillColor(colors.HexColor('#9FB0C4'))
    canvas.setFont('Helvetica', 9)
    canvas.drawRightString(PAGE_W - MARGIN_R, PAGE_H - band_h + 0.16 * inch,
                           'madriverpro.com')
    # Footer band
    foot_h = 0.42 * inch
    canvas.setFillColor(colors.HexColor('#EEF1F5'))
    canvas.rect(0, 0, PAGE_W, foot_h, stroke=0, fill=1)
    canvas.setFillColor(MID_GREY)
    canvas.setFont('Helvetica', 8)
    canvas.drawCentredString(
        PAGE_W / 2, foot_h / 2 - 3,
        'Ryan Rinneard · Director of Instruction · Mad River Golf Club '
        '· Page %d' % doc.page)
    canvas.restoreState()


def _title_block(st, data):
    s = _student(data)
    date_label = data.get('date_label') or ''
    meta = 'Session 1'
    if date_label:
        meta += ' · ' + date_label
    title_tbl = Table(
        [[Paragraph('Your Game Plan', st['doc_title']),
          Paragraph(meta, st['doc_meta'])]],
        colWidths=[CONTENT_W * 0.62, CONTENT_W * 0.38])
    title_tbl.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    return title_tbl


def _player_strip(st, data):
    s = _student(data)
    name = s.get('name') or 'Player'
    hcp = s.get('handicap') or '—'
    exp = s.get('experience') or ''
    goal = s.get('goal') or '—'

    def fact(label, value):
        return Paragraph(
            '<font color="#8A9BB0">%s:</font> <b>%s</b>' % (label, value),
            st['strip_fact'])

    # Tidy the experience value — "3-5 years playing" reads as
    # "Playing: 3-5 years" without the trailing word.
    playing = exp.strip()
    low = playing.lower()
    for suffix in (' playing', ' in the game', ' experience'):
        if low.endswith(suffix):
            playing = playing[:-len(suffix)].strip()
            break
    cells = [
        Paragraph(name, st['strip_name']),
        fact('Handicap', hcp),
        fact('Playing', playing) if playing else Paragraph('', st['strip_fact']),
        fact('Goal', goal),
    ]
    strip = Table([cells],
                  colWidths=[CONTENT_W * 0.24, CONTENT_W * 0.17,
                             CONTENT_W * 0.23, CONTENT_W * 0.36])
    strip.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, 0), 12),
        ('LEFTPADDING', (1, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LINEBELOW', (0, 0), (-1, -1), 2, GOLD),
    ]))
    return strip


def _status_rows(st, rows):
    """A table of [dot, area, read] rows with hairline separators."""
    tbl_rows = []
    for r in rows:
        tbl_rows.append([
            Dot(r['color']),
            Paragraph(r['area'], st['glance_area']),
            Paragraph(r['read'], st['glance_read']),
        ])
    tbl = Table(tbl_rows,
                colWidths=[0.32 * inch, 1.55 * inch, CONTENT_W - 0.32 * inch - 1.55 * inch])
    style = [
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('VALIGN', (0, 0), (0, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, -1), 6),
        ('LEFTPADDING', (1, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
    ]
    for i in range(len(tbl_rows) - 1):
        style.append(('LINEBELOW', (0, i), (-1, i), 0.6, RULE))
    tbl.setStyle(TableStyle(style))
    return tbl


def _callout(st, label, label_color, body, border_color):
    """A callout strip: coloured left border, light fill, label + body."""
    label_para = Paragraph(label.replace(' ', '<br/>'),
                           ParagraphStyle('cl', parent=st['callout_label'],
                                          textColor=label_color))
    body_para = Paragraph(body, st['callout_body'])
    tbl = Table([['', label_para, body_para]],
                colWidths=[0.06 * inch, 0.95 * inch,
                           CONTENT_W - 0.06 * inch - 0.95 * inch])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (1, 0), (-1, -1), CALLOUT_BG),
        ('BACKGROUND', (0, 0), (0, -1), border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, -1), 0),
        ('LEFTPADDING', (1, 0), (1, -1), 12),
        ('LEFTPADDING', (2, 0), (2, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (1, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (1, 0), (-1, -1), 11),
    ]))
    return tbl


def _tag_badge(st, text):
    """A small navy tag badge."""
    badge = Table([[Paragraph((text or '').upper(), st['card_tag'])]],
                  colWidths=[1.15 * inch])
    badge.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY_MID),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    return badge


def _focus_card(st, idx, focus):
    """One Session 1 focus card."""
    num = '%02d' % idx
    header = Table(
        [[Paragraph(num, st['card_num']),
          Paragraph(focus.get('title', ''), st['card_title']),
          _tag_badge(st, focus.get('tag', ''))]],
        colWidths=[0.45 * inch, CONTENT_W - 0.45 * inch - 1.15 * inch, 1.15 * inch])
    header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (1, 0), 'MIDDLE'),
        ('VALIGN', (2, 0), (2, 0), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    why = Paragraph('<b>Why this matters —</b> ' + focus.get('why', ''),
                    st['card_why'])

    cue_tbl = Table(
        [[Paragraph('CUE', st['mini_label']),
          Paragraph('“' + focus.get('cue', '') + '”', st['cue_text'])]],
        colWidths=[0.5 * inch, CONTENT_W - 0.5 * inch])
    cue_tbl.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))

    drill_label = Table([[Paragraph('DRILL', st['mini_label_navy'])]],
                        colWidths=[0.5 * inch])
    drill_label.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY_MID),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    drill_tbl = Table(
        [[drill_label, Paragraph(focus.get('drill', ''), st['drill_text'])]],
        colWidths=[0.5 * inch, CONTENT_W - 0.5 * inch])
    drill_tbl.setStyle(TableStyle([
        ('BACKGROUND', (1, 0), (1, 0), LIGHT_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('LEFTPADDING', (1, 0), (1, 0), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    return KeepTogether([
        header,
        Spacer(1, 2),
        why,
        cue_tbl,
        Spacer(1, 2),
        drill_tbl,
        Spacer(1, 6),
    ])


def _note_row(st, probe):
    """One on-lesson checklist row: arrow + bold label + text."""
    label = Paragraph(probe.get('label', ''), st['note_label'])
    text = Paragraph(probe.get('text', ''), st['note_text'])
    inner = Table([[label], [text]], colWidths=[CONTENT_W - 0.34 * inch])
    inner.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (0, 0), 0),
        ('BOTTOMPADDING', (0, 0), (0, 0), 1),
        ('TOPPADDING', (0, 1), (0, 1), 0),
        ('BOTTOMPADDING', (0, 1), (0, 1), 0),
    ]))
    row = Table([[Paragraph('→', st['arrow']), inner]],
                colWidths=[0.34 * inch, CONTENT_W - 0.34 * inch])
    row.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    return row


def _closing_block(st, text):
    tbl = Table([['', Paragraph(text, st['closing'])]],
                colWidths=[0.06 * inch, CONTENT_W - 0.06 * inch])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), GOLD),
        ('BACKGROUND', (1, 0), (1, -1), CALLOUT_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (0, -1), 0),
        ('LEFTPADDING', (1, 0), (1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (1, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (1, 0), (-1, -1), 9),
    ]))
    return tbl


# ── Public entry point ─────────────────────────────────────────────────────
def build_pdf(output_path, data=None):
    if data is None:
        from _sample_data import SAMPLE_DATA
        data = SAMPLE_DATA

    st = styles()
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=0.78 * inch, bottomMargin=0.62 * inch,
        title='Your Game Plan', author='Ryan Rinneard — RR Golf')

    story = []

    # ── PAGE 1 — THE SNAPSHOT ──────────────────────────────────────────────
    story.append(_title_block(st, data))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width='100%', thickness=1.4, color=GOLD,
                            spaceBefore=2, spaceAfter=12))
    story.append(_player_strip(st, data))

    story.append(Paragraph('THE SNAPSHOT', st['eyebrow']))
    story.append(Paragraph('Your Game at a Glance', st['section_title']))
    story.append(_status_rows(st, _glance_rows(data)))

    story.append(Spacer(1, 16))
    story.append(_callout(st, '#1 PRIORITY', GOLD, _priority(data), GOLD))
    story.append(Spacer(1, 7))
    story.append(_callout(st, 'YOUR STRENGTH', DOT_GREEN, _strength(data), DOT_GREEN))
    story.append(Spacer(1, 7))
    story.append(_callout(st, 'THE GOAL LINE', NAVY, _goal_line(data), NAVY_MID))

    story.append(Paragraph('SETUP READ — WE CHECK THIS FIRST, EVERY TIME',
                           st['eyebrow']))
    story.append(_status_rows(st, _setup_read(data)))

    # ── PAGE 2 — THE PLAN ──────────────────────────────────────────────────
    from reportlab.platypus import PageBreak
    story.append(PageBreak())

    story.append(Paragraph('THE PLAN', st['eyebrow']))
    story.append(Paragraph('Session 1 — Your Three Focus Areas',
                           st['section_title']))
    story.append(Spacer(1, 2))

    focuses = _focuses(data)
    for i, focus in enumerate(focuses, start=1):
        story.append(_focus_card(st, i, focus))

    story.append(Paragraph("ON-LESSON NOTES — RYAN’S CHECKLIST",
                           st['eyebrow']))
    story.append(HRFlowable(width='100%', thickness=0.6, color=RULE,
                            spaceBefore=2, spaceAfter=2))
    probes = _probes(data)
    for i, probe in enumerate(probes):
        story.append(_note_row(st, probe))
        if i < len(probes) - 1:
            story.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                    spaceBefore=0, spaceAfter=0))

    story.append(Spacer(1, 9))
    story.append(_closing_block(st, _closing_line(data)))

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    return output_path


if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/snapshot_sample.pdf'
    build_pdf(out)
    print('Wrote', out)
