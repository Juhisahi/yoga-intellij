// Enhanced Fitness Chatbot
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.querySelector('.send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Expanded knowledge base with more detailed responses
    const knowledgeBase = {
        // Yoga information
        yoga: {
            definition: 'Yoga is a physical, mental, and spiritual practice that originated in ancient India. It includes breath control, meditation, and specific bodily postures to promote overall well-being.',
            benefits: 'Improves posture, strengthens thighs and core, reduces back pain',
            poses: {
                'mountain pose': 'Mountain Pose (Tadasana) is the foundation of all standing poses. Benefits: Improves posture, strengthens thighs and core, reduces back pain. Instructions: Stand tall with feet together, distribute weight evenly, engage thighs, lengthen spine.',
                'warrior pose': 'Warrior Pose (Virabhadrasana) builds strength and stamina. Benefits: Strengthens legs and arms, opens hips and chest. Variations: Warrior I, II, and III for different intensity levels.',
                'tree pose': 'Tree Pose (Vrksasana) improves balance and focus. Benefits: Strengthens thighs, calves, ankles, and spine. Tips: Focus on a fixed point, keep hips level, engage core.',
                'downward dog': 'Downward-Facing Dog (Adho Mukha Svanasana) is a fundamental pose. Benefits: Stretches hamstrings and calves, strengthens arms, energizes the body. Common mistake: Rounded back - keep spine long.'
            },
            beginner: {
                routine: 'Start with: 1. Mountain Pose (1 min), 2. Cat-Cow (2 min), 3. Child\'s Pose (2 min), 4. Downward Dog (1 min), 5. Corpse Pose (3 min). Practice 3-4 times weekly.',
                tips: 'Focus on alignment over depth, use props (blocks/straps), breathe deeply, start with short sessions (10-15 min), be consistent.'
            },
            advanced: {
                progression: 'Try: 1. Sun Salutations, 2. Arm Balances (Crow Pose), 3. Inversions (Headstand), 4. Backbends (Wheel Pose), 5. Longer holds (3-5 min per pose).'
            },
            mudraQA: {
                'what is a mudra': 'A mudra is a symbolic hand gesture used in yoga and meditation to channel energy flow and influence mood or health.',
                'how do mudras work': 'Mudras work by stimulating different areas of the brain and redirecting the body\'s energy flow, enhancing focus, breath control, and inner balance.',
                'what are the most common mudras in yoga': 'Gyan Mudra (Mudra of Knowledge): Enhances concentration and memory.\nPrana Mudra (Mudra of Life): Increases vitality and immunity.\nApana Mudra: Detoxifies and helps in digestion.\nVayu Mudra: Relieves joint pain and nervous tension.\nShunya Mudra: Helps with ear issues and hearing.',
                'how long should a mudra be practiced': 'Generally, mudras are practiced for 15–30 minutes daily. They can also be done in 5-minute intervals several times a day.',
                'is there scientific backing for mudras': 'While mudras are rooted in ancient yogic traditions, modern research shows that hand gestures can impact the brain and nervous system positively—especially when combined with breathing and mindfulness.',
                'can mudras be practiced without doing yoga poses': 'Yes, mudras can be practiced during meditation, while sitting, or even lying down, independent of physical yoga poses.'
            }
        },
        
        // Nutrition information
        nutrition: {
            general: 'Balanced diet includes: 1. Vegetables (50% plate), 2. Lean proteins (25%), 3. Whole grains (25%), 4. Healthy fats (avocado, nuts), 5. Hydration (8 glasses water).',
            preWorkout: '1-2 hours before: Complex carbs (oatmeal) + protein (Greek yogurt). Avoid heavy, fatty foods that digest slowly.',
            postWorkout: 'Within 30 minutes: 3:1 carb to protein ratio (smoothie with banana and protein powder) to replenish glycogen.'
        },
        
        // Fitness information
        fitness: {
            strength: 'Strength training basics: 1. Compound movements (squats, push-ups), 2. Progressive overload, 3. 2-3 sets of 8-12 reps, 4. Rest 48h between muscle groups.',
            flexibility: 'Improve flexibility: 1. Dynamic stretches pre-workout, 2. Static stretches post-workout, 3. Hold stretches 30 sec, 4. Yoga/Pilates 2-3x weekly.'
        },
        
        // Common conditions
        pcod: {
            management: 'PCOS/PCOD management: 1. Low-glycemic diet, 2. Regular exercise, 3. Stress reduction (yoga/meditation), 4. Sleep 7-9 hours, 5. Consider supplements (inositol).'
        },

        // FAQ section
        faq: {
            'yoga vs gym': 'Both have unique benefits. Yoga focuses on flexibility, mental peace, and holistic health, while gym workouts emphasize strength, endurance, and muscle building. Ideally, a balanced routine can combine both for overall wellness.',
            'is yoga enough for weight loss': 'Yes, dynamic forms of yoga like Vinyasa, Power Yoga, or Ashtanga can aid in weight loss, though results may be slower compared to high-intensity gym workouts. Yoga also reduces stress, which supports sustainable weight management.',
            'can yoga build muscle': 'While yoga improves muscle tone, balance, and endurance, it may not result in bulky muscle growth like resistance training at the gym. However, it builds strong, lean muscles and enhances functional strength.',
            'yoga vs meditation': 'Yoga often includes physical poses (asanas) along with breathwork and meditation, while meditation is purely mental and focuses on awareness, mindfulness, and inner peace.',
            'yoga vs pilates': 'Yoga is more spiritual and meditative, while Pilates focuses on core strength, body alignment, and controlled movement. Yoga promotes mind-body harmony; Pilates is more physically targeted.',
            'is yoga a religion or a science': 'Yoga is not a religion; it\'s a spiritual and physical discipline rooted in ancient Indian philosophy. It’s recognized as a science of well-being and self-realization.',
            'can yoga replace modern medicine': 'Yoga supports health and can prevent certain conditions, but it should not replace medical treatment. It\'s best used as a complementary therapy under professional guidance.',
            'is yoga suitable for all age groups': 'Yes. Yoga can be adapted for children, adults, and seniors. Modifications and gentle poses make it accessible to everyone.',
            'how does yoga affect mental health': 'Yoga reduces stress, anxiety, and depression through breath control and mindfulness, and complements traditional therapy by promoting emotional resilience and calm.',
            'can yoga improve focus and productivity': 'Yes. Practicing yoga and mudras increases oxygen flow to the brain and balances energy, leading to natural, sustained focus without the side effects of stimulants.'
        }
    };

    // Enhanced greeting responses
    const greetings = {
        morning: [
            "Namaste! 🌅 A beautiful morning for yoga and wellness. How may I guide you on your journey today?",
            "Good morning! 🌞 The perfect time to start your day with mindfulness and movement. What would you like to explore?",
            "Rise and shine! 🌄 Let's make this morning count with some mindful movement. How can I assist you?"
        ],
        afternoon: [
            "Namaste! 🌤️ I hope your day is going well. How can I support your wellness journey this afternoon?",
            "Good afternoon! 🌿 Perfect time for a mindful break. What would you like to know about yoga or wellness?",
            "Hello there! 🌱 How's your day going? I'm here to help with your yoga and wellness questions."
        ],
        evening: [
            "Namaste! 🌙 A peaceful evening for reflection and gentle movement. How may I assist you?",
            "Good evening! 🌟 Time to unwind and connect with your practice. What would you like to explore?",
            "Hello! 🌜 Perfect time for some calming yoga. How can I help you this evening?"
        ]
    };

    // Enhanced farewell responses
    const farewells = [
        "Namaste! 🙏 May your practice bring you peace and strength. Feel free to return anytime!",
        "Take care! 🌟 Remember, every step in your wellness journey matters. See you soon!",
        "Until next time! 🌿 May your path be filled with mindfulness and joy. Namaste!",
        "Goodbye for now! 🌙 Keep shining and practicing. Your wellness journey continues!",
        "Farewell! 🌅 May your practice bring you closer to your goals. See you soon!"
    ];

    // Add message to chat with typing animation
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        if (!isUser) {
            messageDiv.textContent = '';
            chatMessages.appendChild(messageDiv);
            typeMessage(message, messageDiv);
        } else {
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Typing animation for bot messages
    function typeMessage(message, element) {
        let i = 0;
        const typingSpeed = 30; // milliseconds per character
        
        function type() {
            if (i < message.length) {
                element.textContent += message.charAt(i);
                i++;
                setTimeout(type, typingSpeed);
            }
        }
        
        type();
    }

    // Handle sending messages
    function sendMessage() {
        const userInputElem = document.getElementById("user-input");
        const userInput = userInputElem.value.trim();
        if (!userInput) return;
        addMessage(userInput, true);
        
        // Use the smart response generator
        const response = generateResponse(userInput);
        addMessage(response, false);
        
        userInputElem.value = "";
    }

    // Get appropriate greeting based on time of day
    function getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return greetings.morning[Math.floor(Math.random() * greetings.morning.length)];
        if (hour < 17) return greetings.afternoon[Math.floor(Math.random() * greetings.afternoon.length)];
        return greetings.evening[Math.floor(Math.random() * greetings.evening.length)];
    }

    // Generate intelligent response
    function generateResponse(message) {
        message = message.toLowerCase();

        // Handle greetings
        if (/^(hi|hello|hey|namaste)/.test(message)) {
            return getTimeBasedGreeting();
        }

        // Handle farewells
        if (/^(bye|goodbye|see you|farewell)/.test(message)) {
            return farewells[Math.floor(Math.random() * farewells.length)];
        }

        // Handle thanks
        if (/^(thanks|thank you|appreciate)/.test(message)) {
            return "You're most welcome! 🌟 It's my pleasure to assist you on your wellness journey. Is there anything else you'd like to explore?";
        }

        // Check for FAQ questions first
        for (const [q, a] of Object.entries(knowledgeBase.faq)) {
            if (message.includes(q.toLowerCase())) {
                return a;
            }
        }

        // Check for specific topics
        const topics = {
            yoga: /yoga|pose|asana|meditation|pranayama/,
            nutrition: /nutrition|diet|food|eat|meal/,
            fitness: /fitness|exercise|workout|strength|cardio/,
            pcod: /pcos|pcod|hormon|irregular|menstrual/
        };

        // Find matching topic
        for (const [topic, regex] of Object.entries(topics)) {
            if (regex.test(message)) {
                return findDetailedAnswer(message, topic);
            }
        }

        // Mudra Q&A
        for (const [q, a] of Object.entries(knowledgeBase.yoga.mudraQA)) {
            if (message.includes(q.toLowerCase())) {
                return a;
            }
        }

        // Yoga definition/benefits
        if (message.includes('what is yoga')) {
            return knowledgeBase.yoga.definition;
        }
        if (message.includes('benefits of yoga')) {
            return knowledgeBase.yoga.benefits;
        }

        // Default response
        return "I'm here to guide you on your wellness journey! 🌿 I can help with:\n\n" +
               "• Yoga poses and meditation techniques\n" +
               "• Nutrition and diet advice\n" +
               "• Fitness routines and exercises\n" +
               "• PCOS/PCOD management\n\n" +
               "What would you like to learn more about?";
    }
    
    // Modify the findDetailedAnswer function to provide concise, sectioned responses
    function findDetailedAnswer(message, topic) {
        if (topic === 'yoga') {
            // Check for specific pose questions
            for (const [pose, info] of Object.entries(knowledgeBase.yoga.poses)) {
                if (message.includes(pose)) {
                    return `Let me guide you through ${pose.toUpperCase()} 🌟\n\n${info}\n\nRemember to breathe deeply and listen to your body. Would you like to know more about this pose?`;
                }
            }

            // Check for beginner or advanced routines
            if (message.includes('beginner')) {
                return `BEGINNER YOGA GUIDE 🌱\n\n**Tips for Success:**\n${knowledgeBase.yoga.beginner.tips}\n\n**Recommended Routine:**\n${knowledgeBase.yoga.beginner.routine}\n\nWould you like to start with any specific pose?`;
            }
            if (message.includes('advanced')) {
                return `ADVANCED YOGA GUIDE 🌟\n\n**Progression Tips:**\n${knowledgeBase.yoga.advanced.progression}\n\nWould you like guidance on any specific advanced pose?`;
            }

            // General yoga response divided into sections
            return `Here's what I can share about yoga 🌿\n\n` +
                   `**Definition:**\n${knowledgeBase.yoga.definition}\n\n` +
                   `**Benefits:**\n- ${knowledgeBase.yoga.benefits.split(', ').join('\n- ')}\n\n` +
                   `**Popular Poses:**\n- Mountain Pose\n- Warrior Pose\n- Tree Pose\n- Downward Dog\n\n` +
                   `Would you like to explore any of these topics in detail?`;
        }

        // Return general topic info if no specific match
        const topicInfo = knowledgeBase[topic]?.general || 
                         `Here's what I know about ${topic}:\n${JSON.stringify(knowledgeBase[topic], null, 2)}`;
        
        return `Let me share some insights about ${topic} 🌟\n\n${topicInfo}\n\nWould you like to know more specific details?`;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Initial greeting
    setTimeout(() => {
        addMessage(getTimeBasedGreeting());
    }, 500);
});