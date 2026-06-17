require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Club = require('../models/Club');

const clubs = [
  // ── Technical Clubs ──────────────────────────────────────────────────────────
  {
    clubName: 'ACM Student Chapter',
    slug: 'acm-student-chapter',
    description: 'The ACM Student Chapter at VIT-AP promotes computing as a science and profession. We organize workshops, hackathons, coding contests, and tech talks to foster a strong programming culture on campus.',
    category: 'technical',
    emoji: '💻',
  },
  {
    clubName: 'NextGen Cloud Club',
    slug: 'nextgen-cloud-club',
    description: 'NextGen Cloud Club explores the world of cloud computing, DevOps, and modern infrastructure. Members gain hands-on experience with AWS, Azure, and GCP through projects and certifications.',
    category: 'technical',
    emoji: '☁️',
  },
  {
    clubName: 'Geeks for Geeks VIT-AP Student Chapter',
    slug: 'geeks-for-geeks-vitap',
    description: 'The GFG VIT-AP chapter bridges the gap between academia and industry by focusing on DSA, competitive programming, and interview preparation through regular practice sessions and seminars.',
    category: 'technical',
    emoji: '🧠',
  },
  {
    clubName: 'SEDS Aurora',
    slug: 'seds-aurora',
    description: 'Students for the Exploration and Development of Space (SEDS) Aurora ignites passion for space science, astronomy, and aerospace engineering through talks, projects, and collaborative research.',
    category: 'technical',
    emoji: '🚀',
  },
  {
    clubName: 'Uddeshya Club',
    slug: 'uddeshya-club',
    description: 'Uddeshya is a purpose-driven technical club focused on innovation, problem-solving, and real-world project development. Members work on interdisciplinary projects that create meaningful impact.',
    category: 'technical',
    emoji: '🎯',
  },
  {
    clubName: 'Photon Club',
    slug: 'photon-club',
    description: 'Photon Club dives deep into electronics, photonics, and embedded systems. We conduct workshops on circuit design, Arduino, Raspberry Pi, and participate in national robotics competitions.',
    category: 'technical',
    emoji: '⚡',
  },
  {
    clubName: 'WiOS – Women in Open Source',
    slug: 'wios-women-in-open-source',
    description: 'WiOS empowers women in technology by promoting open-source contribution, collaborative development, and mentorship. We host events, hackathons, and talks celebrating diversity in tech.',
    category: 'technical',
    emoji: '👩‍💻',
  },
  {
    clubName: 'Machine Learning Club (MLC)',
    slug: 'machine-learning-club',
    description: 'MLC fosters a community of AI and ML enthusiasts. From Python basics to neural networks and NLP, we offer structured learning paths, project mentorship, and Kaggle competitions.',
    category: 'technical',
    emoji: '🤖',
  },
  {
    clubName: 'Be A Nerd',
    slug: 'be-a-nerd',
    description: 'Be A Nerd is a club for curious minds passionate about science, technology, and geek culture. We celebrate learning through quizzes, project demos, and interdisciplinary exploration.',
    category: 'technical',
    emoji: '🤓',
  },
  {
    clubName: 'Innovators Quest Club',
    slug: 'innovators-quest-club',
    description: 'Innovators Quest Club is a hub for creative thinkers and builders. We encourage ideation, prototyping, and entrepreneurial thinking through hackathons, design sprints, and startup workshops.',
    category: 'technical',
    emoji: '💡',
  },
  {
    clubName: 'Null Chapter',
    slug: 'null-chapter',
    description: 'Null Chapter is VIT-AP\'s cybersecurity club. We explore ethical hacking, CTF challenges, network security, and digital forensics — building the next generation of security professionals.',
    category: 'technical',
    emoji: '🔐',
  },
  {
    clubName: 'Open Source Community: VIT-AP',
    slug: 'open-source-community-vitap',
    description: 'OSC VIT-AP encourages students to contribute to open-source software. We guide members through Git, GitHub, and real-world open-source projects across diverse tech stacks.',
    category: 'technical',
    emoji: '🌐',
  },
  {
    clubName: 'Computer Society of India (CSI)',
    slug: 'computer-society-of-india',
    description: 'The CSI student chapter bridges academics and industry through technical events, seminars, and national-level competitions. We connect students with the broader computing community of India.',
    category: 'technical',
    emoji: '🖥️',
  },
  {
    clubName: 'VIT-AP IEEE Student Branch',
    slug: 'vitap-ieee-student-branch',
    description: 'The IEEE Student Branch at VIT-AP connects engineering students with the world\'s largest technical professional organization. We organize technical talks, paper presentations, and project competitions.',
    category: 'technical',
    emoji: '📡',
  },

  // ── Non-Technical Clubs ───────────────────────────────────────────────────────
  {
    clubName: 'Rotaract Club',
    slug: 'rotaract-club',
    description: 'Rotaract Club is a service organization for young adults that develops leadership skills and promotes community service. We collaborate on social projects that positively impact local communities.',
    category: 'non-technical',
    emoji: '🌍',
  },
  {
    clubName: 'SPIC MACAY Heritage Club',
    slug: 'spic-macay-heritage-club',
    description: 'SPIC MACAY promotes awareness of Indian classical music, dance, and other intangible aspects of Indian heritage. We organize classical concerts, dance recitals, and cultural awareness programs.',
    category: 'non-technical',
    emoji: '🎭',
  },
  {
    clubName: 'Anchoring Club',
    slug: 'anchoring-club',
    description: 'The Anchoring Club develops public speaking, anchoring, and event hosting skills. Members get opportunities to anchor major college events, honing their confidence and stage presence.',
    category: 'non-technical',
    emoji: '🎤',
  },
  {
    clubName: 'Western Music Club',
    slug: 'western-music-club',
    description: 'Western Music Club is a vibrant community for music lovers. From rock to jazz to pop, we host jam sessions, open-mics, and performances, nurturing musical talent across all genres.',
    category: 'non-technical',
    emoji: '🎸',
  },
  {
    clubName: 'Indian Classical Music Club (ICMC)',
    slug: 'indian-classical-music-club',
    description: 'ICMC preserves and promotes the rich tradition of Indian classical music — Carnatic and Hindustani. We organize concerts, workshops by renowned artists, and regular practice sessions.',
    category: 'non-technical',
    emoji: '🎵',
  },
  {
    clubName: 'Knit',
    slug: 'knit-club',
    description: 'Knit is a creative arts and crafts club where students explore handicrafts, textile arts, and DIY fashion. A relaxing space to express creativity through hands and imagination.',
    category: 'non-technical',
    emoji: '🧶',
  },
  {
    clubName: 'Beat The Heat Dance Club',
    slug: 'beat-the-heat-dance-club',
    description: 'Beat The Heat is VIT-AP\'s premier dance club, celebrating all dance forms — western freestyle, hip-hop, Bollywood, and contemporary. We perform at college fests and inter-college competitions.',
    category: 'non-technical',
    emoji: '💃',
  },
  {
    clubName: 'Book Buzz Club',
    slug: 'book-buzz-club',
    description: 'Book Buzz Club is a literary community for avid readers. We host book discussions, author talks, reading challenges, and creative writing workshops to foster a love for literature.',
    category: 'non-technical',
    emoji: '📚',
  },
  {
    clubName: 'Otaku Haven Club',
    slug: 'otaku-haven-club',
    description: 'Otaku Haven is the hub for anime, manga, and Japanese culture enthusiasts at VIT-AP. We screen anime, host cosplay events, drawing contests, and celebrate the vibrant world of Japanese pop culture.',
    category: 'non-technical',
    emoji: '🎌',
  },
  {
    clubName: 'Kalki Personality Development Club',
    slug: 'kalki-personality-development-club',
    description: 'Kalki focuses on holistic personality development through soft skills training, debate, group discussions, and leadership workshops — preparing students for life beyond academics.',
    category: 'non-technical',
    emoji: '🌟',
  },
  {
    clubName: 'Photography Club – VIT-AP',
    slug: 'photography-club-vitap',
    description: 'The Photography Club nurtures visual storytelling skills. We conduct photography walks, editing workshops, photo contests, and exhibitions to celebrate the art of capturing moments.',
    category: 'non-technical',
    emoji: '📷',
  },
  {
    clubName: 'ELA Club',
    slug: 'ela-club',
    description: 'ELA (English Language & Arts) Club cultivates English communication and creative expression through debates, poetry slams, drama performances, and literary events.',
    category: 'non-technical',
    emoji: '✍️',
  },
  {
    clubName: 'Think and Thrive',
    slug: 'think-and-thrive',
    description: 'Think and Thrive is a mental wellness and mindfulness club dedicated to promoting student well-being. We organize meditation sessions, mental health talks, and stress-relief workshops.',
    category: 'non-technical',
    emoji: '🧘',
  },
  {
    clubName: 'DIY Club',
    slug: 'diy-club',
    description: 'The DIY Club is all about making and creating. From upcycling to woodworking, electronics tinkering to art installations — if you can imagine it, we help you build it.',
    category: 'non-technical',
    emoji: '🛠️',
  },

  // ── Regional Clubs & Chapters ─────────────────────────────────────────────────
  {
    clubName: 'Malayalam Association',
    slug: 'malayalam-association',
    description: 'The Malayalam Association celebrates the rich culture, language, and traditions of Kerala. We organize Onam, Vishu celebrations, cultural programs, and connect Keralite students on campus.',
    category: 'regional',
    emoji: '🌴',
  },
  {
    clubName: 'Namma Karunadu Kannada Association',
    slug: 'namma-karunadu-kannada-association',
    description: 'Namma Karunadu celebrates Kannada language, culture, and heritage. We commemorate Rajyotsava, organize folk performances, and build a strong Karnataka community at VIT-AP.',
    category: 'regional',
    emoji: '🏵️',
  },
  {
    clubName: 'Bengali Association: Bongojo',
    slug: 'bengali-association-bongojo',
    description: 'Bongojo is the Bengali student association that celebrates the vibrant culture of Bengal. We organize Durga Puja, Rabindra Jayanti, cultural nights, and unite Bengali-speaking students.',
    category: 'regional',
    emoji: '🎨',
  },
  {
    clubName: 'Chaitra Telugu Association',
    slug: 'chaitra-telugu-association',
    description: 'Chaitra celebrates Telugu culture, language, and traditions. We organize Ugadi, Bathukamma, and other Telugu festivals, bringing together students who share a love for Andhra and Telangana heritage.',
    category: 'regional',
    emoji: '🌸',
  },
  {
    clubName: 'Semmozhi Tamil Mandram',
    slug: 'semmozhi-tamil-mandram',
    description: 'Semmozhi Tamil Mandram promotes the classical Tamil language and rich Dravidian culture. We celebrate Tamil New Year, Pongal, and organize cultural events that honor our ancient literary heritage.',
    category: 'regional',
    emoji: '🎊',
  },
  {
    clubName: 'Haryana Association',
    slug: 'haryana-association',
    description: 'The Haryana Association celebrates the folk traditions, culture, and values of Haryana. We bring together students from the state through cultural events, festivals, and community bonding activities.',
    category: 'regional',
    emoji: '🌾',
  },

  // ── Professional Clubs ────────────────────────────────────────────────────────
  {
    clubName: 'IETE Students Forum',
    slug: 'iete-students-forum',
    description: 'IETE Students Forum is the student wing of the Institution of Electronics and Telecommunication Engineers. We promote electronics, telecommunications, and IT through technical events and competitions.',
    category: 'professional',
    emoji: '📻',
  },

  // ── Social Outreach ───────────────────────────────────────────────────────────
  {
    clubName: 'Rotaract Club – Social Outreach',
    slug: 'rotaract-club-social-outreach',
    description: 'This wing of Rotaract Club focuses exclusively on social outreach — organizing blood donation drives, environmental campaigns, education for underprivileged children, and community volunteering programs.',
    category: 'social_outreach',
    emoji: '❤️',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let inserted = 0;
    let skipped = 0;

    for (const club of clubs) {
      const exists = await Club.findOne({ slug: club.slug });
      if (exists) {
        console.log(`⏭️  Skipped (already exists): ${club.clubName}`);
        skipped++;
        continue;
      }

      await Club.create({
        clubName: club.clubName,
        slug: club.slug,
        description: club.description,
        category: club.category,
        logo: '',
        coverImage: '',
        coordinatorId: null,
        isActive: true,
        isApproved: true,
        totalEvents: 0,
        totalMembers: 0,
      });

      console.log(`✅ Added: ${club.emoji} ${club.clubName} [${club.category}]`);
      inserted++;
    }

    console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
