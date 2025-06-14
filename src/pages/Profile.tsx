import React, { useState, useEffect } from 'react';
import {
    User, Calendar, Droplets, Heart, Pill, AlertTriangle, Stethoscope,
    Phone, Save, Edit3, CheckCircle, Quote, AlertCircle, ChevronDown,
    ChevronUp, X, Clock, FileText, Plus, Trash2, Upload
} from 'lucide-react';
import Layout from '../components/Layout';
import { useProfile, type MedicalReport } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { processReportFile } from '@/utils/reportExtractor';

const healthQuotes = [
    "Your health is an investment, not an expense.",
    "Prevention is better than cure.",
    "Small steps today lead to a healthier tomorrow.",
    "Your medical profile is your health passport.",
    "Complete information saves lives in emergencies."
];

const conditionOptions = [
    'Abdominal aortic aneurysm', 'Achilles tendinopathy', 'Acne', 'Acute cholecystitis',
    'Acute lymphoblastic leukaemia', 'Acute myeloid leukaemia', 'Acute pancreatitis', 'Addison\'s disease',
    'Adenomyosis', 'Alcohol-related liver disease', 'Allergic rhinitis', 'Allergies', 'Alzheimer\'s disease',
    'Anal cancer', 'Anaphylaxis', 'Angina', 'Angioedema', 'Ankle sprain', 'Ankle avulsion fracture',
    'Ankylosing spondylitis', 'Anorexia nervosa', 'Anxiety disorders', 'Aplastic anaemia', 'Appendicitis',
    'Arterial thrombosis', 'Arthritis', 'Asbestosis', 'Asthma', 'Ataxia', 'Atopic eczema', 'Atrial fibrillation',
    'Attention deficit hyperactivity disorder (ADHD)', 'Autism', 'Back problems', 'Bacterial vaginosis',
    'Becker muscular dystrophy', 'Benign prostate enlargement', 'Bile duct cancer (cholangiocarcinoma)',
    'Binge eating disorder (BED)', 'Bipolar disorder', 'Bladder cancer', 'Blood poisoning (sepsis)',
    'Bone cancer', 'Bowel cancer', 'Bowel incontinence', 'Bowel polyps', 'Bow legs and knock knees',
    'Brain stem death', 'Brain tumours', 'Breast cancer', 'Bronchiectasis', 'Bronchitis', 'Bulimia nervosa',
    'Bunion (hallux valgus)', 'Carcinoid syndrome and carcinoid tumours', 'Cardiovascular disease',
    'Carpal tunnel syndrome', 'Catarrh', 'Cellulitis', 'Cerebral palsy', 'Cervical cancer',
    'Cervical spondylosis', 'Chest and rib injury', 'Chest infection', 'Chickenpox', 'Chilblains',
    'Chlamydia', 'Chronic fatigue syndrome', 'Chronic kidney disease', 'Chronic lymphocytic leukaemia',
    'Chronic myeloid leukaemia', 'Chronic obstructive pulmonary disease (COPD)', 'Chronic pain',
    'Chronic pancreatitis', 'Cirrhosis', 'Clavicle fracture', 'Clostridium difficile', 'Coeliac disease',
    'Cold sore', 'Coma', 'Common cold', 'Concussion', 'Congenital heart disease',
    'Congenital muscular dystrophy (CMD)', 'Conjunctivitis', 'Constipation', 'Coronary heart disease',
    'Coronavirus (COVID-19)', 'Costochondritis', 'Cough', 'Crohn\'s disease', 'Croup', 'Cystic fibrosis',
    'Cystitis', 'Deafblindness', 'Deep vein thrombosis', 'Degenerative cervical myelopathy', 'Dehydration',
    'Delirium', 'Dementia', 'Dementia with Lewy bodies', 'Dental abscess', 'Depression',
    'Dermatitis herpetiformis', 'Diabetic retinopathy', 'Diarrhoea', 'Discoid eczema',
    'Diverticular disease and diverticulitis', 'Dizziness', 'Down\'s syndrome', 'Dry mouth',
    'Duchenne muscular dystrophy (DMD)', 'Dysphagia', 'Dystonia', 'Eating disorders', 'Earache',
    'Early miscarriage', 'Earwax build-up', 'Ebola virus disease', 'Ectopic pregnancy', 'Elbow fracture',
    'Edwards\' syndrome', 'Emery-Dreifuss muscular dystrophy', 'Endometriosis', 'Epilepsy',
    'Erectile dysfunction', 'Escherichia coli (E. coli) O157', 'Ewing sarcoma', 'Eye cancer',
    'Facioscapulohumeral muscular dystrophy (FSHD)', 'Farting', 'Febrile seizures', 'Globus sensation',
    'Fever', 'Fibroids', 'Fibromyalgia', 'Flat feet', 'Flu', 'Foetal alcohol syndrome', 'Food allergy',
    'Food poisoning', 'Fragility fracture of the hip', 'Frozen shoulder',
    'Functional neurological disorder (FND)', 'Fungal nail infection', 'Gallbladder cancer', 'Gallstones',
    'Ganglion cyst', 'Gastroenteritis', 'Gastro-oesophageal reflux disease (GORD)',
    'Generalised anxiety disorder (GAD)', 'Genital herpes', 'Genital symptoms', 'Genital warts',
    'Germ cell tumours', 'Glandular fever', 'Golfer\'s elbow', 'Gonorrhoea', 'Gout',
    'Greater trochanteric pain syndrome', 'Gum disease', 'Haemorrhoids (piles)',
    'Hand, foot and mouth disease', 'Hay fever', 'Head and neck cancer', 'Head lice and nits', 'Headaches',
    'Hearing loss', 'Heart attack', 'Heart block', 'Heart disease', 'Heart failure', 'Heart palpitations',
    'Heatstroke', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hiatus hernia',
    'High blood pressure (hypertension)', 'High cholesterol', 'HIV', 'Hives', 'Hodgkin lymphoma',
    'Huntington\'s disease', 'Hydrocephalus', 'Hyperglycaemia', 'Hyperhidrosis', 'Hypoglycaemia',
    'Idiopathic pulmonary fibrosis', 'Impetigo', 'Indigestion', 'Ingrown toenail', 'Infertility',
    'Inflammatory bowel disease (IBD)', 'Inherited heart conditions', 'Insomnia', 'Intoeing',
    'Iron deficiency anaemia', 'Irritable bowel syndrome (IBS)', 'Itching', 'Itchy bottom', 'Itchy skin',
    'Joint hypermobility', 'Kaposi\'s sarcoma', 'Kidney cancer', 'Kidney infection', 'Kidney stones',
    'Labyrinthitis', 'Lactose intolerance', 'Laryngeal cancer', 'Laryngitis', 'Late miscarriage',
    'Leg cramps', 'Lichen planus', 'Limb girdle muscular dystrophy', 'Lipoedema', 'Liver cancer',
    'Liver disease', 'Liver tumours', 'Loss of libido', 'Low blood pressure (hypotension)', 'Lung cancer',
    'Lupus', 'Lyme disease', 'Lymphoedema', 'Lymphogranuloma venereum (LGV)', 'Malaria',
    'Malignant brain tumour', 'Malnutrition', 'Measles', 'Meningitis', 'Meniere\'s disease', 'Menopause',
    'Mesothelioma', 'Metacarpal fracture', 'Middle ear infection', 'Migraine', 'Minor head injury',
    'Miscarriage', 'Molar pregnancy', 'Motor neurone disease (MND)', 'Mouth cancer', 'Mouth ulcer',
    'Multiple myeloma', 'Multiple sclerosis (MS)', 'Multiple system atrophy (MSA)', 'Mumps',
    'Munchausen\'s syndrome', 'Muscular dystrophy', 'Myalgic encephalomyelitis (ME/CFS)',
    'Myasthenia gravis', 'Myotonic dystrophy', 'Nasal and sinus cancer', 'Nasopharyngeal cancer',
    'Neck injury', 'Neck problems', 'Neuroblastoma', 'Neuroendocrine tumours',
    'Non-alcoholic fatty liver disease (NAFLD)', 'Non-Hodgkin lymphoma', 'Norovirus', 'Nosebleed',
    'Obesity', 'Obsessive compulsive disorder (OCD)', 'Obstructive sleep apnoea',
    'Oculopharyngeal muscular dystrophy (OPMD)', 'Oesophageal cancer', 'Oral thrush', 'Osteoarthritis',
    'Osteoporosis', 'Osteosarcoma', 'Outer ear infection', 'Ovarian cancer', 'Ovarian cyst',
    'Overactive thyroid', 'Pain in the ball of the foot', 'Paget\'s disease of the nipple',
    'Pancreatic cancer', 'Panic disorder', 'Parkinson\'s disease', 'Patau\'s syndrome',
    'Patellofemoral pain syndrome', 'Pelvic inflammatory disease', 'Pelvic organ prolapse',
    'Penile cancer', 'Peripheral neuropathy', 'Personality disorder', 'PIMS', 'Plantar heel pain',
    'Pleurisy', 'Pneumonia', 'Polio', 'Polycystic ovary syndrome (PCOS)', 'Polymyalgia rheumatica',
    'Post-concussion syndrome', 'Post-polio syndrome', 'Post-traumatic stress disorder (PTSD)',
    'Postural orthostatic tachycardia syndrome (PoTS)', 'Postnatal depression', 'Pressure ulcers',
    'Progressive supranuclear palsy (PSP)', 'Prostate cancer', 'Psoriasis', 'Psoriatic arthritis',
    'Psychosis', 'Pubic lice', 'Pulmonary hypertension', 'Phobias', 'Raynaud\'s phenomenon',
    'Reactive arthritis', 'Recurrent miscarriage', 'Restless legs syndrome',
    'Respiratory syncytial virus (RSV)', 'Retinoblastoma', 'Rhabdomyosarcoma', 'Rheumatoid arthritis',
    'Ringworm', 'Rosacea', 'Scabies', 'Scarlet fever', 'Schizophrenia', 'Sciatica', 'Scoliosis',
    'Seasonal affective disorder (SAD)', 'Sepsis', 'Septic shock', 'Severe head injury', 'Shingles',
    'Shortness of breath', 'Sickle cell disease', 'Sinusitis', 'Sjogren\'s syndrome',
    'Skin cancer (melanoma)', 'Skin cancer (non-melanoma)', 'Photosensitivity', 'Skin rashes in children',
    'Slapped cheek syndrome', 'Soft tissue sarcomas', 'Sore throat', 'Spina bifida', 'Spinal stenosis',
    'Spleen problems', 'Stillbirth', 'Stomach ache', 'Stomach cancer', 'Stomach ulcer', 'Streptococcus A',
    'Stress, anxiety and low mood', 'Stroke', 'Subacromial pain syndrome',
    'Sudden infant death syndrome (SIDS)', 'Suicide', 'Sunburn', 'Supraventricular tachycardia',
    'Swollen glands', 'Syphilis', 'Self-harm', 'Tennis elbow', 'Testicular cancer',
    'Testicular lumps and swellings', 'Thirst', 'Threadworms', 'Thrush', 'Thumb fracture',
    'Thyroid cancer', 'Tick bites', 'Tinnitus', 'Tonsillitis', 'Tooth decay', 'Toothache',
    'Tourette\'s syndrome', 'Transient ischaemic attack (TIA)', 'Transverse myelitis',
    'Trichomonas infection', 'Trigeminal neuralgia', 'Trigger thumb/finger', 'Tuberculosis (TB)',
    'Type 1 diabetes', 'Type 2 diabetes', 'Ulcerative colitis', 'Underactive thyroid',
    'Urinary incontinence', 'Urinary tract infection (UTI)', 'Urticaria (hives)', 'Vaginal cancer',
    'Vaginal discharge', 'Varicose eczema', 'Varicose veins', 'Vascular dementia', 'Venous leg ulcer',
    'Vertigo', 'Vitamin B12 or folate deficiency anaemia', 'Vomiting', 'Vulval cancer',
    'Warts and verrucas', 'Whiplash', 'Whooping cough', 'Wilms\' tumour',
    'Wolff-Parkinson-White syndrome', 'Womb (uterus) cancer', 'Wrist fracture', 'Yellow fever',
    'Zika virus', 'None'
];

const symptomOptions = [
    'Redness', 'Swelling', 'Blisters', 'Itching', 'Hives', 'Sneezing', 'Runny nose', 'Stuffy nose',
    'Coughing', 'Wheezing', 'Shortness of breath', 'Difficulty breathing', 'Chest pain', 'Headache',
    'Dizziness', 'Lightheadedness', 'Fever', 'Chills', 'Nausea', 'Vomiting', 'Diarrhoea',
    'Constipation', 'Abdominal pain', 'Bloating', 'Dry mouth', 'Sore throat', 'Mouth ulcers',
    'Toothache', 'Hearing loss', 'Tinnitus (ringing in ears)', 'Earache', 'Itchy skin', 'Skin rash',
    'Swollen glands', 'Fatigue', 'Breathlessness', 'Loss of appetite', 'Weight loss', 'Back pain',
    'Neck pain', 'Joint pain', 'Muscle pain', 'Tingling', 'Numbness',
    'Discharge (vaginal, nipple, etc.)', 'Inverted nipple', 'Bowel incontinence',
    'Urinary incontinence', 'Burning sensation', 'Globus sensation (lump in throat)', 'Feeling faint',
    'Farting (flatulence)', 'Sunburn (red, hot, tender skin)', 'Blurred vision', 'Weakness',
    'Cramping', 'Stiffness', 'Clicking or popping joints', 'Limited range of motion', 'Bruising',
    'Lumps or swellings', 'Tick bite rash (e.g., bull\'s-eye)', 'Vertigo (spinning sensation)',
    'Tingling in fingers/toes', 'Tooth sensitivity', 'Delayed healing',
    'Hot, warm skin over affected area', 'Fluid-filled bumps or sores', 'Blood in urine or stool',
    'Itchy bottom', 'Shuffling or toe walking (in children)', 'Trips or falls (in young children)',
    'None'
];

const Profile = () => {
    const { profileData, updateProfile, isLoading } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profileData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(healthQuotes[0]);
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(formData.heightUnit || 'cm');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(formData.weightUnit || 'kg');
    const [showConditionsDropdown, setShowConditionsDropdown] = useState(false);
    const [showSymptomsDropdown, setShowSymptomsDropdown] = useState(false);
    const [customCondition, setCustomCondition] = useState('');
    const [customSymptom, setCustomSymptom] = useState('');
    const [conditionSearch, setConditionSearch] = useState('');
    const [symptomSearch, setSymptomSearch] = useState('');

    useEffect(() => {
        setFormData(profileData);
        const quoteInterval = setInterval(() => {
            setCurrentQuote(healthQuotes[Math.floor(Math.random() * healthQuotes.length)]);
        }, 8000);
        return () => clearInterval(quoteInterval);
    }, [profileData]);

    const convertHeight = (value: string, from: 'cm' | 'ft', to: 'cm' | 'ft'): { feet: string; inches: string } | string => {
        if (from === to) return value;
        if (from === 'cm' && to === 'ft') {
            const totalInches = parseFloat(value) / 2.54;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            return { feet: feet.toString(), inches: inches.toString() };
        }
        if (from === 'ft' && to === 'cm') {
            const [feet, inches] = value.split("'");
            const totalInches = (parseInt(feet) * 12) + (parseInt(inches?.replace('"', '') || '0'));
            return Math.round(totalInches * 2.54).toString();
        }
        return value;
    };

    const convertWeight = (value: string, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): string => {
        if (from === to) return value;
        const numValue = parseFloat(value);
        if (from === 'kg' && to === 'lbs') {
            return (numValue * 2.20462).toFixed(1);
        }
        if (from === 'lbs' && to === 'kg') {
            return (numValue / 2.20462).toFixed(1);
        }
        return value;
    };

    const handleHeightUnitChange = (newUnit: 'cm' | 'ft') => {
        if (newUnit === heightUnit) return;
        setHeightUnit(newUnit);
        if (formData.height) {
            if (newUnit === 'ft') {
                const cm = parseFloat(formData.height);
                const inches = cm / 2.54;
                const feet = Math.floor(inches / 12);
                const remainingInches = Math.round(inches % 12);
                setFormData({
                    ...formData,
                    heightUnit: 'ft',
                    heightFeet: feet.toString(),
                    heightInches: remainingInches.toString(),
                    height: undefined
                });
            } else {
                const feet = formData.heightFeet ? parseInt(formData.heightFeet) : 0;
                const inches = formData.heightInches ? parseInt(formData.heightInches) : 0;
                const totalCm = Math.round((feet * 12 + inches) * 2.54);
                setFormData({
                    ...formData,
                    heightUnit: 'cm',
                    height: totalCm.toString(),
                    heightFeet: undefined,
                    heightInches: undefined
                });
            }
        }
    };

    const handleWeightUnitChange = (newUnit: 'kg' | 'lbs') => {
        if (newUnit === weightUnit) return;
        setWeightUnit(newUnit);
        if (formData.weight) {
            const value = parseFloat(formData.weight);
            const converted = newUnit === 'kg'
                ? (value / 2.20462).toFixed(1)
                : (value * 2.20462).toFixed(1);
            setFormData({
                ...formData,
                weight: converted,
                weightUnit: newUnit
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let updatedFormData = { ...formData };

        if (name === 'heightFeet' || name === 'heightInches') {
            const feet = name === 'heightFeet' ? value : formData.heightFeet;
            const inches = name === 'heightInches' ? value : formData.heightInches;
            updatedFormData = {
                ...updatedFormData,
                [name]: value,
                heightUnit: 'ft',
                height: undefined // Clear the cm value when using feet/inches
            };
            console.log('Updated height (ft):', { feet, inches });
        } else if (name === 'height') {
            // Store the value and unit for cm
            updatedFormData = {
                ...updatedFormData,
                height: value,
                heightUnit: 'cm',
                heightFeet: undefined, // Clear feet/inches when using cm
                heightInches: undefined
            };
            console.log('Updated height (cm):', value);
        } else if (name === 'weight') {
            // Ensure weight is stored with its unit
            updatedFormData = {
                ...updatedFormData,
                weight: value,
                weightUnit: weightUnit || 'kg' // Default to kg if not set
            };
            console.log('Updated weight:', { value, unit: weightUnit || 'kg' });
        } else {
            updatedFormData = {
                ...updatedFormData,
                [name]: value
            };
        }

        setFormData(updatedFormData);

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleConditionSelect = (condition: string) => {
        const currentConditions = formData.conditions ? formData.conditions.split(',') : [];

        if (condition === 'None') {
            setFormData({
                ...formData,
                conditions: 'None'
            });
            return;
        }

        if (currentConditions.includes('None')) {
            currentConditions.splice(currentConditions.indexOf('None'), 1);
        }

        if (currentConditions.includes(condition)) {
            const updatedConditions = currentConditions.filter(c => c !== condition);
            setFormData({
                ...formData,
                conditions: updatedConditions.join(',')
            });
        } else {
            setFormData({
                ...formData,
                conditions: [...currentConditions, condition].join(',')
            });
        }
    };

    const handleRemoveCondition = (conditionToRemove: string) => {
        const currentConditions = formData.conditions ? formData.conditions.split(',').filter(c => c.trim()) : [];
        const updatedConditions = currentConditions.filter(c => c !== conditionToRemove);
        setFormData({
            ...formData,
            conditions: updatedConditions.length ? updatedConditions.join(',') : 'None'
        });
    };

    const handleSymptomSelect = (symptom: string) => {
        const currentSymptoms = formData.symptoms ? formData.symptoms.split(',') : [];

        if (symptom === 'None') {
            setFormData({
                ...formData,
                symptoms: 'None'
            });
            return;
        }

        if (currentSymptoms.includes('None')) {
            currentSymptoms.splice(currentSymptoms.indexOf('None'), 1);
        }

        if (currentSymptoms.includes(symptom)) {
            const updatedSymptoms = currentSymptoms.filter(s => s !== symptom);
            setFormData({
                ...formData,
                symptoms: updatedSymptoms.join(',')
            });
        } else {
            setFormData({
                ...formData,
                symptoms: [...currentSymptoms, symptom].join(',')
            });
        }
    };

    const handleRemoveSymptom = (symptomToRemove: string) => {
        const currentSymptoms = formData.symptoms ? formData.symptoms.split(',').filter(s => s.trim()) : [];
        const updatedSymptoms = currentSymptoms.filter(s => s !== symptomToRemove);
        setFormData({
            ...formData,
            symptoms: updatedSymptoms.length ? updatedSymptoms.join(',') : 'None'
        });
    };

    const handleAddCustomCondition = () => {
        if (!customCondition.trim()) return;

        const currentConditions = formData.conditions ? formData.conditions.split(',').filter(c => c !== 'None') : [];
        if (!currentConditions.includes(customCondition.trim())) {
            setFormData({
                ...formData,
                conditions: [...currentConditions, customCondition.trim()].join(',')
            });
        }
        setCustomCondition('');
    };

    const handleAddCustomSymptom = () => {
        if (!customSymptom.trim()) return;

        const currentSymptoms = formData.symptoms ? formData.symptoms.split(',').filter(s => s !== 'None') : [];
        if (!currentSymptoms.includes(customSymptom.trim())) {
            setFormData({
                ...formData,
                symptoms: [...currentSymptoms, customSymptom.trim()].join(',')
            });
        }
        setCustomSymptom('');
    };

    const filteredConditions = () => {
        if (!conditionSearch) return conditionOptions;
        return conditionOptions.filter(condition =>
            condition.toLowerCase().includes(conditionSearch.toLowerCase())
        );
    };

    const filteredSymptoms = () => {
        if (!symptomSearch) return symptomOptions;
        return symptomOptions.filter(symptom =>
            symptom.toLowerCase().includes(symptomSearch.toLowerCase())
        );
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const requiredFields = ['name', 'age', 'gender', 'bloodGroup'];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

        // Validate age
        if (formData.age) {
            const age = parseInt(formData.age);
            if (!Number.isInteger(age) || age <= 0) {
                newErrors.age = 'Age must be a positive number';
            } else if (age > 120) {
                newErrors.age = 'Age must be less than 120';
            } else if (age < 1) {
                newErrors.age = 'Age must be at least 1';
            }
        } else {
            newErrors.age = 'Age is required';
        }

        // Validate height based on unit
        if (!formData.heightUnit) {
            newErrors.height = 'Height unit is required';
        } else if (formData.heightUnit === 'cm') {
            const heightCm = parseFloat(formData.height);
            if (!formData.height || isNaN(heightCm)) {
                newErrors.height = 'Height is required';
            } else if (heightCm < 30 || heightCm > 250) {
                newErrors.height = 'Height must be between 30 and 250 cm';
            }
            console.log('Height validation (cm):', { heightCm, valid: !newErrors.height });
        } else if (formData.heightUnit === 'ft') {
            if (!formData.heightFeet || parseInt(formData.heightFeet) < 1) {
                newErrors.heightFeet = 'Feet value is required and must be at least 1';
            } else if (parseInt(formData.heightFeet) > 8) {
                newErrors.heightFeet = 'Height (feet) must be 8 or less';
            }
            if (formData.heightInches && (parseInt(formData.heightInches) < 0 || parseInt(formData.heightInches) >= 12)) {
                newErrors.heightInches = 'Inches must be between 0 and 11';
            }
            console.log('Height validation (ft):', { 
                feet: formData.heightFeet, 
                inches: formData.heightInches,
                valid: !newErrors.heightFeet && !newErrors.heightInches 
            });
        }

        // Validate weight
        if (!formData.weight) {
            newErrors.weight = 'Weight is required';
        } else {
            const weight = parseFloat(formData.weight);
            if (isNaN(weight) || weight <= 0) {
                newErrors.weight = 'Weight must be a positive number';
            } else if (formData.weightUnit === 'kg' && weight > 500) {
                newErrors.weight = 'Weight must be less than 500 kg';
            } else if (formData.weightUnit === 'lbs' && weight > 1100) {
                newErrors.weight = 'Weight must be less than 1100 lbs';
            }
            console.log('Weight validation:', {
                weight,
                unit: formData.weightUnit,
                valid: !newErrors.weight
            });
        }

        // Validate family & friends emergency contacts
        if (!formData.emergencyContacts || formData.emergencyContacts.length === 0) {
            newErrors.emergencyContacts = 'At least one emergency contact is required';
        } else {
            formData.emergencyContacts.forEach((contact, index) => {
                const contactPrefix = `emergencyContact${index}`;
                if (!contact.name) {
                    newErrors[`${contactPrefix}Name`] = 'Contact name is required';
                }
                if (!contact.relationship) {
                    newErrors[`${contactPrefix}Relationship`] = 'Relationship is required';
                }
                if (!contact.number) {
                    newErrors[`${contactPrefix}Number`] = 'Phone number is required';
                } else {
                    // Remove any non-digit characters for validation
                    const cleanNumber = contact.number.replace(/\D/g, '');
                    if (cleanNumber.length !== 10) {
                        newErrors[`${contactPrefix}Number`] = 'Phone number must be exactly 10 digits';
                    } else if (!/^[1-9]\d{9}$/.test(cleanNumber)) {
                        newErrors[`${contactPrefix}Number`] = 'Enter a valid 10-digit phone number';
                    }
                }
            });
        }

        // Validate doctor contacts
        if (formData.doctorContacts && formData.doctorContacts.length > 0) {
            formData.doctorContacts.forEach((doctor, index) => {
                const doctorPrefix = `doctorContact${index}`;
                if (!doctor.name) {
                    newErrors[`${doctorPrefix}Name`] = 'Doctor name is required';
                }
                if (!doctor.specialization) {
                    newErrors[`${doctorPrefix}Specialization`] = 'Specialization is required';
                }
                if (!doctor.number) {
                    newErrors[`${doctorPrefix}Number`] = 'Phone number is required';
                } else {
                    // Remove any non-digit characters for validation
                    const cleanNumber = doctor.number.replace(/\D/g, '');
                    if (cleanNumber.length !== 10) {
                        newErrors[`${doctorPrefix}Number`] = 'Phone number must be exactly 10 digits';
                    } else if (!/^[1-9]\d{9}$/.test(cleanNumber)) {
                        newErrors[`${doctorPrefix}Number`] = 'Enter a valid 10-digit phone number';
                    }
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        console.log('Starting save process...');
        console.log('Current form data:', formData);

        if (!validateForm()) {
            console.log('Form validation failed');
            toast.error('Please fill in all required fields correctly');
            return;
        }

        try {
            updateProfile(formData);
            setIsEditing(false);
            setSaveSuccess(true);
            toast.success('Profile saved successfully!');
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile. Please try again.');
        }
    };    const formFields = [
        { name: 'name', label: 'Full Name', icon: User, type: 'text', required: true },
        { name: 'age', label: 'Age', icon: Calendar, type: 'number', required: true },
        { name: 'gender', label: 'Gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other'], required: true },
        { name: 'bloodGroup', label: 'Blood Group', icon: Droplets, type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
        { name: 'medications', label: 'Current Medications', icon: Pill, type: 'text', required: false },
        { name: 'allergies', label: 'Allergies', icon: AlertTriangle, type: 'text', required: false },
        { name: 'emergencyContactName', label: 'Emergency Contact Name', icon: User, type: 'text', required: true },
        { name: 'emergencyContactNumber', label: 'Emergency Contact Number', icon: Phone, type: 'tel', required: true },
        { name: 'emergencyDoctorName', label: 'Emergency Doctor Name', icon: Stethoscope, type: 'text', required: true },
        { name: 'emergencyDoctorNumber', label: 'Emergency Doctor Number', icon: Phone, type: 'tel', required: true }
    ];

    const calculateBMI = () => {
        try {
            // Convert height to meters regardless of unit
            let heightInMeters = 0;
            
            // If using centimeters
            if (formData.heightUnit === 'cm' && formData.height) {
                const heightCm = parseFloat(formData.height);
                if (isNaN(heightCm) || heightCm <= 0) return null;
                heightInMeters = heightCm / 100;
            } 
            // If using feet and inches
            else if (formData.heightUnit === 'ft' && formData.heightFeet) {
                const feet = parseInt(formData.heightFeet || '0');
                const inches = parseInt(formData.heightInches || '0');
                if (feet <= 0) return null;
                const totalInches = (feet * 12) + inches;
                heightInMeters = totalInches * 0.0254; // Convert inches to meters
            } else {
                return null;
            }

            // Handle cases where height is unreasonable
            if (heightInMeters < 0.3 || heightInMeters > 2.5) return null;

            // Convert weight to kg regardless of unit
            if (!formData.weight) return null;
            const weight = parseFloat(formData.weight);
            if (isNaN(weight) || weight <= 0) return null;
            
            const weightInKg = formData.weightUnit === 'kg' ? weight : weight / 2.20462;

            // Handle cases where weight is unreasonable
            if (weightInKg < 20 || weightInKg > 500) return null;

            // Calculate BMI
            const bmi = weightInKg / (heightInMeters * heightInMeters);
            
            // Extra validation to ensure reasonable BMI
            if (isNaN(bmi) || !isFinite(bmi) || bmi < 10 || bmi > 50) return null;
            
            return bmi.toFixed(1);
        } catch (error) {
            console.error('BMI calculation error:', error);
            return null;
        }
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
        if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
        if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
        return { category: 'Obese', color: 'text-red-600' };
    };

    const getConditionCount = () => {
        if (!formData.conditions || formData.conditions === 'None') return 0;
        return formData.conditions.split(',').filter(condition => condition.trim()).length;
    };

    const isProfileComplete = () => {
        const requiredFields = ['name', 'age', 'gender', 'bloodGroup', 'emergencyContactName', 'emergencyContactNumber'];
        return requiredFields.every(field => !!formData[field]);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-full"></div>
                        <div className="h-4 w-48 bg-muted rounded"></div>
                        <div className="h-2 w-32 bg-muted rounded"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {saveSuccess && (
                    <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
                        <CheckCircle className="w-5 h-5" />
                        <span>Profile saved successfully!</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Profile</h1>
                            <p className="text-gray-600 max-w-2xl">
                                Keep your medical profile updated for better healthcare insights and emergency preparedness
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                }`}
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                        </button>
                    </div>
                </div>                {!isEditing ? (
                    // Profile Summary View (shown by default)
                    <div className="space-y-6">
                        {/* About Me and Health Information in a grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* About Me Section in View Mode */}
                            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
                                <div className="flex items-center space-x-4 mb-6">
                                    <User className="w-6 h-6 text-slate-600" />
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">About Me</h2>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    {formFields.slice(0, 4).map((field) => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                                <field.icon className="w-4 h-4 text-gray-500" />
                                                <span>{field.label}</span>
                                            </label>
                                            <div className="text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                                                {typeof formData[field.name as keyof typeof formData] === 'string' 
                                                    ? formData[field.name as keyof typeof formData] as string 
                                                    : 'Not set'}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Height display */}
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>Height</span>
                                        </label>
                                        <div className="text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                                            {heightUnit === 'cm' ? 
                                                `${formData.height || 'Not set'} cm` : 
                                                `${formData.heightFeet || '0'}' ${formData.heightInches || '0'}`}
                                        </div>
                                    </div>

                                    {/* Weight display */}
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>Weight</span>
                                        </label>
                                        <div className="text-slate-800 bg-slate-50 px-3 py-2 rounded-lg">
                                            {formData.weight ? 
                                                `${formData.weight} ${formData.weightUnit || 'kg'}` : 
                                                'Not set'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Health Section */}
                            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <Heart className="w-6 h-6 text-slate-600" />
                                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Health Information</h2>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${isProfileComplete() ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {isProfileComplete() ? 'COMPLETE' : 'INCOMPLETE'}
                                    </div>
                                </div>

                                {/* Status Cards */}
                                                {/* Health Information Cards will be moved out of this section */}

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-600 font-semibold block mb-1">Medical Conditions:</span>
                                        <p className="text-slate-800">{profileData.conditions || 'None reported'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-600 font-semibold block mb-1">Current Medications:</span>
                                        <p className="text-slate-800">{profileData.medications || 'None reported'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-600 font-semibold block mb-1">Allergies:</span>
                                        <p className="text-slate-800">{profileData.allergies || 'None reported'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-600 font-semibold block mb-1">Present Symptoms:</span>
                                        <p className="text-slate-800">{profileData.symptoms || 'None reported'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contacts Section */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <AlertTriangle className="w-6 h-6 text-slate-600" />
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Emergency Contacts</h2>
                                </div>
                            </div>                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Family & Friends Emergency Contacts */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Family & Friends</h3>
                                    <div className="space-y-4">
                                        {formData.emergencyContacts && formData.emergencyContacts.length > 0 ? (
                                            formData.emergencyContacts.map((contact, index) => (
                                                <div key={index} className="relative overflow-hidden p-4 bg-red-50 rounded-lg border border-red-100">
                                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                                                        <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full text-slate-900">
                                                            <path d="M256 256c52.805 0 96-43.195 96-96s-43.195-96-96-96-96 43.195-96 96 43.195 96 96 96zm0 48c-63.598 0-192 32.402-192 96v48h384v-48c0-63.598-128.402-96-192-96z" />
                                                        </svg>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="font-semibold text-slate-700">Contact {index + 1}</h3>
                                                            {isEditing && (
                                                                <button
                                                                    onClick={() => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
                                                                        }));
                                                                    }}
                                                                    className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-lg font-semibold text-slate-800">
                                                                {contact.name} ({contact.relationship})
                                                            </p>
                                                            <p className="text-slate-600">{contact.number}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                                <p className="text-amber-800">No family or friend contacts provided</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Medical Professionals */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Professionals</h3>
                                    <div className="space-y-4">
                                        {formData.doctorContacts && formData.doctorContacts.length > 0 ? (
                                            formData.doctorContacts.map((doctor, index) => (
                                                <div key={index} className="relative overflow-hidden p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                                                        <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full text-blue-900">
                                                            <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm112 224h-80v80h-64v-80h-80v-64h80v-80h64v80h80v64z" />
                                                        </svg>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="font-semibold text-slate-700">Doctor {index + 1}</h3>
                                                            {isEditing && (
                                                                <button
                                                                    onClick={() => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            doctorContacts: prev.doctorContacts.filter((_, i) => i !== index)
                                                                        }));
                                                                    }}
                                                                    className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-lg font-semibold text-slate-800">
                                                                {doctor.name} ({doctor.specialization})
                                                            </p>
                                                            <p className="text-slate-600">{doctor.number}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                                <p className="text-amber-800">No medical professional contacts provided</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Edit Form (shown when editing)
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* About Me Section */}
                            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
                                <div className="flex items-center space-x-4 mb-6">
                                    <User className="w-6 h-6 text-slate-600" />
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">About Me</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">                                {formFields
                                        .filter(f => f.name !== 'height')
                                        .slice(0, 4)
                                        .concat([{ name: 'weight', label: 'Weight', icon: User, type: 'number', required: false }])
                                        .map((field) => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                                <field.icon className="w-4 h-4 text-gray-500" />
                                                <span>
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </span>
                                            </label>

                                            {field.name === 'weight' ? (
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="number"
                                                        name="weight"
                                                        value={formData.weight || ''}
                                                        onChange={handleChange}
                                                        className={`medical-input flex-1 ${errors.weight ? 'border-red-300 bg-red-50' : ''}`}
                                                        placeholder={`Enter your weight in ${weightUnit}`}
                                                    />
                                                    <div className="flex rounded-md border border-gray-300">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleWeightUnitChange('kg')}
                                                            className={`px-3 py-2 text-sm font-medium rounded-l-md ${weightUnit === 'kg'
                                                                ? 'bg-blue-100 text-blue-700 border-r border-gray-300'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-300'
                                                                }`}
                                                        >
                                                            kg
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleWeightUnitChange('lbs')}
                                                            className={`px-3 py-2 text-sm font-medium rounded-r-md ${weightUnit === 'lbs'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            lbs
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : field.type === 'select' ? (
                                                <select
                                                    name={field.name}
                                                    value={typeof formData[field.name as keyof typeof formData] === 'string' ? formData[field.name as keyof typeof formData] as string : ''}
                                                    onChange={handleChange}
                                                    className={`medical-input ${errors[field.name] ? 'border-red-300 bg-red-50' : ''}`}
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options?.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    name={field.name}
                                                    value={typeof formData[field.name as keyof typeof formData] === 'string' ? formData[field.name as keyof typeof formData] as string : ''}
                                                    onChange={handleChange}
                                                    className={`medical-input ${errors[field.name] ? 'border-red-300 bg-red-50' : ''}`}
                                                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                                                />
                                            )}
                                            {errors[field.name] && (
                                                <p className="text-red-500 text-xs flex items-center mt-1">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {errors[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Height with unit toggle */}
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>Height</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            {heightUnit === 'cm' ? (
                                                <input
                                                    type="number"
                                                    name="height"
                                                    value={formData.height || ''}
                                                    onChange={handleChange}
                                                    className={`medical-input flex-1 ${errors.height ? 'border-red-300 bg-red-50' : ''}`}
                                                    placeholder="Enter your height in cm"
                                                />
                                            ) : (
                                                <div className="flex space-x-2 flex-1">
                                                    <input
                                                        type="number"
                                                        name="heightFeet"
                                                        value={formData.heightFeet || ''}
                                                        onChange={handleChange}
                                                        className={`medical-input w-1/2 ${errors.heightFeet ? 'border-red-300 bg-red-50' : ''}`}
                                                        placeholder="Feet"
                                                    />
                                                    <input
                                                        type="number"
                                                        name="heightInches"
                                                        value={formData.heightInches || ''}
                                                        onChange={handleChange}
                                                        className={`medical-input w-1/2 ${errors.heightInches ? 'border-red-300 bg-red-50' : ''}`}
                                                        placeholder="Inches"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex rounded-md border border-gray-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleHeightUnitChange('cm')}
                                                    className={`px-3 py-2 text-sm font-medium rounded-l-md ${heightUnit === 'cm'
                                                        ? 'bg-blue-100 text-blue-700 border-r border-gray-300'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-300'
                                                        }`}
                                                >
                                                    cm
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleHeightUnitChange('ft')}
                                                    className={`px-3 py-2 text-sm font-medium rounded-r-md ${heightUnit === 'ft'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    ft
                                                </button>
                                            </div>
                                        </div>
                                        {(errors.height || errors.heightFeet || errors.heightInches) && (
                                            <p className="text-red-500 text-xs flex items-center mt-1">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.height || errors.heightFeet || errors.heightInches}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Health Information Section */}
                            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <Heart className="w-6 h-6 text-slate-600" />
                                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Health Information</h2>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {formFields.slice(4, 6).map((field) => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                                <field.icon className="w-4 h-4 text-gray-500" />
                                                <span>
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </span>
                                            </label>
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={typeof formData[field.name as keyof typeof formData] === 'string' ? formData[field.name as keyof typeof formData] as string : ''}
                                                onChange={handleChange}
                                                className={`medical-input ${errors[field.name] ? 'border-red-300 bg-red-50' : ''}`}
                                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                            />
                                            {errors[field.name] && (
                                                <p className="text-red-500 text-xs flex items-center mt-1">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {errors[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Conditions Selector */}
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <Heart className="w-4 h-4 text-gray-500" />
                                            <span>Existing Conditions</span>
                                        </label>
                                        <div className="relative">
                                            <div className={`w-full min-h-[100px] p-3 border border-gray-200 rounded-lg mb-2 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                                                }`}>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.conditions && formData.conditions !== 'None' &&
                                                        formData.conditions.split(',').map((condition) => (
                                                            <div
                                                                key={condition}
                                                                className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                                                            >
                                                                {condition}
                                                                {isEditing && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveCondition(condition)}
                                                                        className="ml-2 text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowConditionsDropdown(!showConditionsDropdown)}
                                                disabled={!isEditing}
                                                className={`medical-input flex justify-between items-center ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span>
                                                    {!formData.conditions || formData.conditions === 'None'
                                                        ? 'Select or type conditions'
                                                        : 'Add more conditions'
                                                    }
                                                </span>
                                                {showConditionsDropdown ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            {showConditionsDropdown && isEditing && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                    <div className="p-2 space-y-2 border-b border-gray-200">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Type or search conditions..."
                                                                value={customCondition}
                                                                onChange={(e) => {
                                                                    setCustomCondition(e.target.value);
                                                                    setConditionSearch(e.target.value);
                                                                }}
                                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddCustomCondition}
                                                                disabled={!customCondition.trim()}
                                                                className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="max-h-60 overflow-auto">
                                                        <div className="p-2 space-y-1">
                                                            {filteredConditions().map((condition) => (
                                                                <div
                                                                    key={condition}
                                                                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${formData.conditions?.includes(condition)
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : 'hover:bg-gray-50'
                                                                        }`}
                                                                    onClick={() => handleConditionSelect(condition)}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.conditions?.includes(condition)}
                                                                        readOnly
                                                                        className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <span>{condition}</span>
                                                                </div>
                                                            ))}
                                                            {filteredConditions().length === 0 && customCondition.trim() === '' && (
                                                                <p className="text-gray-500 text-center py-2">No matching conditions found</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Symptoms Selector */}
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <Stethoscope className="w-4 h-4 text-gray-500" />
                                            <span>Current Symptoms</span>
                                        </label>
                                        <div className="relative">
                                            <div className={`w-full min-h-[100px] p-3 border border-gray-200 rounded-lg mb-2 ${!isEditing ? 'bg-gray-50' : 'bg-white'
                                                }`}>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.symptoms && formData.symptoms !== 'None' &&
                                                        formData.symptoms.split(',').map((symptom) => (
                                                            <div
                                                                key={symptom}
                                                                className="inline-flex items-center bg-rose-50 text-rose-700 rounded-full px-3 py-1 text-sm"
                                                            >
                                                                {symptom}
                                                                {isEditing && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveSymptom(symptom)}
                                                                        className="ml-2 text-rose-500 hover:text-rose-700"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowSymptomsDropdown(!showSymptomsDropdown)}
                                                disabled={!isEditing}
                                                className={`medical-input flex justify-between items-center ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span>
                                                    {!formData.symptoms || formData.symptoms === 'None'
                                                        ? 'Select or type symptoms'
                                                        : 'Add more symptoms'
                                                    }
                                                </span>
                                                {showSymptomsDropdown ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            {showSymptomsDropdown && isEditing && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                    <div className="p-2 space-y-2 border-b border-gray-200">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Type or search symptoms..."
                                                                value={customSymptom}
                                                                onChange={(e) => {
                                                                    setCustomSymptom(e.target.value);
                                                                    setSymptomSearch(e.target.value);
                                                                }}
                                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddCustomSymptom}
                                                                disabled={!customSymptom.trim()}
                                                                className="px-3 py-2 bg-rose-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-700 transition-colors"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="max-h-60 overflow-auto">
                                                        <div className="p-2 space-y-1">
                                                            {filteredSymptoms().map((symptom) => (
                                                                <div
                                                                    key={symptom}
                                                                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${formData.symptoms?.includes(symptom)
                                                                        ? 'bg-rose-50 text-rose-700'
                                                                        : 'hover:bg-gray-50'
                                                                        }`}
                                                                    onClick={() => handleSymptomSelect(symptom)}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.symptoms?.includes(symptom)}
                                                                        readOnly
                                                                        className="mr-2 rounded text-rose-600 focus:ring-rose-500"
                                                                    />
                                                                    <span>{symptom}</span>
                                                                </div>
                                                            ))}
                                                            {filteredSymptoms().length === 0 && customSymptom.trim() === '' && (
                                                                <p className="text-gray-500 text-center py-2">No matching symptoms found</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                        {/* Emergency Contacts Section */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <AlertTriangle className="w-6 h-6 text-slate-600" />
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Emergency Contacts</h2>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            const newContact = {
                                                name: '',
                                                number: '',
                                                relationship: '',
                                                isNew: true
                                            };
                                            setFormData(prev => ({
                                                ...prev,
                                                emergencyContacts: [...(prev.emergencyContacts || []), newContact]
                                            }));
                                        }}
                                        disabled={!isEditing}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${isEditing 
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Contact
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newDoctor = {
                                                name: '',
                                                number: '',
                                                specialization: '',
                                                isNew: true
                                            };
                                            setFormData(prev => ({
                                                ...prev,
                                                doctorContacts: [...(prev.doctorContacts || []), newDoctor]
                                            }));
                                        }}
                                        disabled={!isEditing}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${isEditing 
                                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Doctor
                                    </button>
                                </div>
                            </div>                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Emergency Contacts */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Family & Friends</h3>                                    <div className="space-y-4">
                                        {formData.emergencyContacts && formData.emergencyContacts.length > 0 ? (
                                            formData.emergencyContacts.map((contact, index) => (
                                                <div key={index} className="relative overflow-hidden p-4 bg-red-50 rounded-lg border border-red-100">
                                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                                                        <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full text-slate-900">
                                                            <path d="M256 256c52.805 0 96-43.195 96-96s-43.195-96-96-96-96 43.195-96 96 43.195 96 96 96zm0 48c-63.598 0-192 32.402-192 96v48h384v-48c0-63.598-128.402-96-192-96z" />
                                                        </svg>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="font-semibold text-slate-700">Contact {index + 1}</h3>
                                                            {isEditing && (
                                                                <button
                                                                    onClick={() => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
                                                                        }));
                                                                    }}
                                                                    className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {isEditing ? (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={contact.name || ''}
                                                                    onChange={(e) => {
                                                                        const updatedContacts = [...formData.emergencyContacts];
                                                                        updatedContacts[index] = {
                                                                            ...contact,
                                                                            name: e.target.value
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            emergencyContacts: updatedContacts
                                                                        }));
                                                                    }}
                                                                    placeholder="Contact Name"
                                                                    className="medical-input w-full"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={contact.relationship || ''}
                                                                    onChange={(e) => {
                                                                        const updatedContacts = [...formData.emergencyContacts];
                                                                        updatedContacts[index] = {
                                                                            ...contact,
                                                                            relationship: e.target.value
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            emergencyContacts: updatedContacts
                                                                        }));
                                                                    }}
                                                                    placeholder="Relationship"
                                                                    className="medical-input w-full"
                                                                />
                                                                <div className="space-y-1">
                                                                    <input
                                                                        type="tel"
                                                                        value={contact.number || ''}
                                                                        onChange={(e) => {
                                                                            const updatedContacts = [...formData.emergencyContacts];
                                                                            updatedContacts[index] = {
                                                                                ...contact,
                                                                                number: e.target.value
                                                                            };
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                emergencyContacts: updatedContacts
                                                                            }));
                                                                            // Clear error when user starts typing
                                                                            if (errors[`emergencyContactNumber${index}`]) {
                                                                                setErrors(prev => {
                                                                                    const newErrors = { ...prev };
                                                                                    delete newErrors[`emergencyContactNumber${index}`];
                                                                                    return newErrors;
                                                                                });
                                                                            }
                                                                        }}
                                                                        placeholder="Phone Number"
                                                                        className={`medical-input w-full ${
                                                                            errors[`emergencyContactNumber${index}`] ? 'border-red-300 bg-red-50' : ''
                                                                        }`}
                                                                    />
                                                                    {errors[`emergencyContactNumber${index}`] && (
                                                                        <p className="text-red-500 text-xs flex items-center mt-1">
                                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                                            {errors[`emergencyContactNumber${index}`]}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <p className="text-lg font-semibold text-slate-800">
                                                                    {contact.name} ({contact.relationship})
                                                                </p>
                                                                <p className="text-slate-600">{contact.number}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                                <p className="text-amber-800">No emergency contacts provided</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Doctor Contacts */}                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Professionals</h3>                                    <div className="space-y-4">
                                        {formData.doctorContacts && formData.doctorContacts.length > 0 ? (
                                            formData.doctorContacts.map((doctor, index) => (
                                                <div key={index} className="relative overflow-hidden p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                                                        <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full text-blue-900">
                                                            <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm112 224h-80v80h-64v-80h-80v-64h80v-80h64v80h80v64z" />
                                                        </svg>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="font-semibold text-slate-700">Doctor {index + 1}</h3>
                                                            {isEditing && (
                                                                <button
                                                                    onClick={() => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            doctorContacts: prev.doctorContacts.filter((_, i) => i !== index)
                                                                        }));
                                                                    }}
                                                                    className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {isEditing ? (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={doctor.name || ''}
                                                                    onChange={(e) => {
                                                                        const updatedDoctors = [...formData.doctorContacts];
                                                                        updatedDoctors[index] = {
                                                                            ...doctor,
                                                                            name: e.target.value
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            doctorContacts: updatedDoctors
                                                                        }));
                                                                    }}
                                                                    placeholder="Doctor Name"
                                                                    className="medical-input w-full"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={doctor.specialization || ''}
                                                                    onChange={(e) => {
                                                                        const updatedDoctors = [...formData.doctorContacts];
                                                                        updatedDoctors[index] = {
                                                                            ...doctor,
                                                                            specialization: e.target.value
                                                                        };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            doctorContacts: updatedDoctors
                                                                        }));
                                                                    }}
                                                                    placeholder="Specialization"
                                                                    className="medical-input w-full"
                                                                />
                                                                <div className="space-y-1">
                                                                    <input
                                                                        type="tel"
                                                                        value={doctor.number || ''}
                                                                        onChange={(e) => {
                                                                            const updatedDoctors = [...formData.doctorContacts];
                                                                            updatedDoctors[index] = {
                                                                                ...doctor,
                                                                                number: e.target.value
                                                                            };
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                doctorContacts: updatedDoctors
                                                                            }));
                                                                            // Clear error when user starts typing
                                                                            if (errors[`doctorContactNumber${index}`]) {
                                                                                setErrors(prev => {
                                                                                    const newErrors = { ...prev };
                                                                                    delete newErrors[`doctorContactNumber${index}`];
                                                                                    return newErrors;
                                                                                });
                                                                            }
                                                                        }}
                                                                        placeholder="Phone Number"
                                                                        className={`medical-input w-full ${
                                                                            errors[`doctorContactNumber${index}`] ? 'border-red-300 bg-red-50' : ''
                                                                        }`}
                                                                    />
                                                                    {errors[`doctorContactNumber${index}`] && (
                                                                        <p className="text-red-500 text-xs flex items-center mt-1">
                                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                                            {errors[`doctorContactNumber${index}`]}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <p className="text-lg font-semibold text-slate-800">
                                                                    {doctor.name} ({doctor.specialization})
                                                                </p>
                                                                <p className="text-slate-600">{doctor.number}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                                <p className="text-amber-800">No doctor contacts provided</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(profileData);
                                    setErrors({});
                                    setIsEditing(false);
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Profile</span>
                            </button>
                        </div>
                    </div>
                )}

                {!isEditing && (
                    <div className="grid sm:grid-cols-4 gap-6 mt-8">
                        <div className="medical-card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Profile Status</h3>
                            <p className={`text-2xl font-bold ${isProfileComplete() ? 'text-blue-600' : 'text-amber-600'}`}>
                                {isProfileComplete() ? 'Complete' : 'Incomplete'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {isProfileComplete() ? 'All required fields completed' : 'Some required fields are missing'}
                            </p>
                        </div>

                        <div className="medical-card text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Droplets className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Blood Type</h3>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formData.bloodGroup || 'Not set'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {formData.bloodGroup ? 'Important for emergencies' : 'Please update your profile'}
                            </p>
                        </div>

                        <div className="medical-card text-center bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800">BMI Index</h3>
                            {(() => {
                                const bmi = calculateBMI();
                                if (!bmi && (!formData.height || !formData.weight)) {
                                    return (
                                        <>
                                            <p className="text-2xl font-bold text-amber-600">Not available</p>
                                            <p className="text-sm text-gray-600 mt-1">Add height & weight</p>
                                        </>
                                    );
                                }
                                if (!bmi) {
                                    return (
                                        <>
                                            <p className="text-2xl font-bold text-amber-600">Invalid input</p>
                                            <p className="text-sm text-gray-600 mt-1">Check height & weight values</p>
                                        </>
                                    );
                                }
                                const { category, color } = getBMICategory(parseFloat(bmi));
                                return (
                                    <>
                                        <p className="text-2xl font-bold text-amber-600">{bmi}</p>
                                        <p className={`text-sm font-medium ${color} mt-1`}>{category}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.heightUnit === 'cm' ? `${formData.height} cm` : `${formData.heightFeet}'${formData.heightInches}"`} • {formData.weight} {formData.weightUnit}
                                        </p>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="medical-card text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-800">Conditions</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {getConditionCount()}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {getConditionCount() ? 'Conditions noted' : 'No conditions reported'}
                            </p>
                        </div>
                    </div>)}

                {!isProfileComplete() && !isEditing && (
                    <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-amber-800">
                                Your profile is incomplete. Please update the following fields:
                            </p>
                            <ul className="list-disc list-inside text-amber-700 mt-1">
                                {['conditions', 'medications', 'allergies', 'symptoms'].map(field => (
                                    !formData[field] || formData[field] === 'None' ? (
                                        <li key={field}>- {field.charAt(0).toUpperCase() + field.slice(1)}</li>
                                    ) : null
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Profile;