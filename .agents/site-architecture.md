# Site Architecture — RR Golf at Mad River

*Last updated: 2026-04-04*

## Page Hierarchy

```
Homepage (/)
├── About (/about)
├── Lessons (/lessons)
│   ├── Private Lessons (/lessons/private)
│   ├── Lessons With a Friend (/lessons/semi-private)
│   ├── On-Course Lessons (/lessons/on-course)
│   ├── Lesson Packages (/lessons/packages)
│   └── Junior Lessons (/lessons/juniors)
├── Programs (/programs)
│   ├── Ladies Golf Academy (/programs/ladies-golf-academy)
│   ├── Thursday Night Experiences (/programs/thursday-night-experiences)
│   ├── Golf Schools (/programs/golf-schools)
│   └── Train to Play Junior Camps (/programs/train-to-play)
├── Articles (/articles)
│   └── [Individual posts] (/articles/{slug})
├── Testimonials (/testimonials)
└── Contact (/contact)
```

## Header Nav

| Position | Item | Type |
|----------|------|------|
| Logo | RR Golf | Links to / |
| 1 | About | Single link |
| 2 | Lessons | Dropdown: Private, Semi-Private, On-Course, Packages, Juniors |
| 3 | Programs | Dropdown: Ladies Academy, Thursday Nights, Golf Schools, Train to Play |
| 4 | Articles | Single link |
| 5 | Testimonials | Single link |
| CTA | **Book Now** | Acuity Scheduling link — always visible |

## Footer

| Lessons | Programs | Connect |
|---------|----------|---------|
| Private Lessons | Ladies Golf Academy | Contact |
| Semi-Private | Thursday Night Experiences | Book Now (Acuity) |
| On-Course | Golf Schools | Mad River Golf Club |
| Packages | Train to Play | Ace Track Golf |
| Juniors | | Social links |

## Acuity Integration Points

- Header "Book Now" CTA on every page
- Embedded Acuity scheduler on each lesson/program page (filtered by service type)
- Sticky mobile booking button
- Contact page includes Acuity embed as primary booking method

## Internal Linking Strategy

- Homepage → all lesson types, featured programs, testimonials
- Each lesson page → relevant testimonial, packages page, Book Now
- Ladies Academy ↔ Thursday Night Experiences (cross-sell)
- Blog posts → relevant lesson/program pages + Book Now
- About → Lessons, Programs, Testimonials
- Every page → Book Now CTA

## SEO Notes

- Local SEO targeting: Creemore, Collingwood, Blue Mountains, Wasaga Beach, Barrie
- Articles support long-tail golf instruction queries
- Each lesson/program page targets specific service keywords
- Testimonials page supports branded search trust signals
