import { api } from './api';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as XLSX from '@e965/xlsx';
import {
  ThemeProvider, createTheme, CssBaseline,
  AppBar, Toolbar, Typography, Button, IconButton,
  Container, Grid, Box, Card, CardContent, CardActionArea,
  Chip, LinearProgress, CircularProgress, Collapse,
  Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, List, ListItem, ListItemIcon, ListItemText,
  Divider, Tooltip, TextField, Menu, MenuItem, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Snackbar, Switch, FormControlLabel, Tabs, Tab, Badge, Drawer,
} from '@mui/material';
import {
  Security as SecurityIcon,
  PhishingOutlined as PhishingIcon,
  LockOutlined as LockIcon,
  PhoneAndroidOutlined as DeviceIcon,
  ReportOutlined as ReportIcon,
  TrendingUp, TrendingDown, TrendingFlat,
  EmojiEvents as TrophyIcon,
  BarChart as BarChartIcon,
  AutoAwesome as SparkleIcon,
  Refresh as RefreshIcon,
  MenuBook as BookIcon,
  ArrowForward, ArrowBack,
  CheckCircle, Cancel,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
  Person as PersonIcon,
  LocalFireDepartment as FlameIcon,
  Flag as FlagIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DeleteForever as DeleteIcon,
  Storage as StorageIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  QuestionAnswer as QIcon,
  ContentCopy as CopyIcon,
  RestoreFromTrash as RestoreIcon,
  CheckCircleOutlined as CheckCircleOutline,
  RadioButtonUnchecked,
  PlayArrow as PlayArrowIcon,
  EmojiEventsOutlined as CertIcon,
  Assessment as ReportIcon2,
  Timer as TimerIcon,
  Leaderboard as LeaderboardIcon,
  Today as DeadlineIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  GetApp as ExportIcon,
  Palette as PaletteIcon,
  ColorLens as ColorLensIcon,
  FormatColorFill as FillIcon,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ─── THEME SYSTEM ────────────────────────────────────────────────────────────
// Colours are stored in localStorage and applied live via React context.
// Default = current Comp X dark brand palette.

const THEME_KEY = 'cbt:theme:v1';

const DEFAULT_THEME_COLOURS = {
  primary:    '#D4002B',   // accent / CTA colour
  appBar:     '#1D1D1B',   // nav bar background
  surface:    '#141413',   // page background
  card:       '#252523',   // card / paper background
  border:     '#3D3D3B',   // dividers
  textPri:    '#F0EFED',   // primary text
  textSec:    '#ADADAB',   // secondary text
};

const PRESET_THEMES = [
  { name:'Comp X (Default)', colours: { primary:'#D4002B', appBar:'#1D1D1B', surface:'#141413', card:'#252523', border:'#3D3D3B', textPri:'#F0EFED', textSec:'#ADADAB' }},
  { name:'Ocean Dark',       colours: { primary:'#0288D1', appBar:'#0A1929', surface:'#071420', card:'#0D2137', border:'#1A3A5C', textPri:'#E3F2FD', textSec:'#90CAF9' }},
  { name:'Forest Dark',      colours: { primary:'#2E7D32', appBar:'#0A1A0A', surface:'#071207', card:'#0F1F0F', border:'#1B3A1B', textPri:'#F1F8E9', textSec:'#A5D6A7' }},
  { name:'Purple Haze',      colours: { primary:'#7B1FA2', appBar:'#12071A', surface:'#0D0514', card:'#1A0D26', border:'#3B1A5C', textPri:'#F3E5F5', textSec:'#CE93D8' }},
  { name:'Slate',            colours: { primary:'#455A64', appBar:'#0D1117', surface:'#090D12', card:'#131B22', border:'#21262D', textPri:'#E6EDF3', textSec:'#8B949E' }},
  { name:'Amber Dark',       colours: { primary:'#F57C00', appBar:'#1A1200', surface:'#120D00', card:'#1F1800', border:'#3D3000', textPri:'#FFF8E1', textSec:'#FFE082' }},
  { name:'Rose Dark',        colours: { primary:'#C2185B', appBar:'#1A0714', surface:'#12040E', card:'#1F0A18', border:'#3D1030', textPri:'#FCE4EC', textSec:'#F48FB1' }},
  { name:'Light (Classic)',  colours: { primary:'#1565C0', appBar:'#1565C0', surface:'#F5F5F5', card:'#FFFFFF', border:'#E0E0E0', textPri:'#1D1D1B', textSec:'#616161' }},
];

function loadThemeColours() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? { ...DEFAULT_THEME_COLOURS, ...JSON.parse(saved) } : DEFAULT_THEME_COLOURS;
  } catch { return DEFAULT_THEME_COLOURS; }
}

function saveThemeColours(c) {
  try { localStorage.setItem(THEME_KEY, JSON.stringify(c)); } catch {}
}

// Derive a darker shade (for hover states etc.)
function darken(hex, amount=0.2) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n>>16)&255) * (1-amount)));
  const g = Math.max(0, Math.round(((n>>8) &255) * (1-amount)));
  const b = Math.max(0, Math.round(( n     &255) * (1-amount)));
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
}

function lighten(hex, amount=0.3) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n>>16)&255) + (255-((n>>16)&255)) * amount));
  const g = Math.min(255, Math.round(((n>>8) &255) + (255-((n>>8) &255)) * amount));
  const b = Math.min(255, Math.round(( n     &255) + (255-( n     &255)) * amount));
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
}

// Determine if a colour is dark (for contrast text)
function isDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  return (0.299*r + 0.587*g + 0.114*b) < 128;
}

function buildBrand(c) {
  return {
    red:       c.primary,
    redDark:   darken(c.primary, 0.25),
    redLight:  lighten(c.primary, 0.3),
    black:     c.appBar,
    surface:   c.surface,
    card:      c.card,
    border:    c.border,
    textPri:   c.textPri,
    textSec:   c.textSec,
    textDis:   darken(c.textSec, 0.3),
  };
}

function buildTheme(c) {
  const isLightMode = !isDark(c.surface);
  const brand = buildBrand(c);
  return createTheme({
    palette: {
      mode: isLightMode ? 'light' : 'dark',
      primary:   { main: c.primary, dark: darken(c.primary,0.2), light: lighten(c.primary,0.3), contrastText: isDark(c.primary)?'#FFFFFF':'#1D1D1B' },
      secondary: { main: '#F0A500', dark: '#C07D00', light: '#FFD54F', contrastText: '#1D1D1B' },
      error:     { main: '#FF5252' },
      warning:   { main: '#F0A500' },
      success:   { main: '#4CAF50' },
      info:      { main: '#29B6F6' },
      background:{ default: c.surface, paper: c.card },
      text:      { primary: c.textPri, secondary: c.textSec, disabled: darken(c.textSec,0.3) },
      divider:   c.border,
    },
    typography: {
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton:        { styleOverrides: { root:{ textTransform:'none', fontWeight:600 }, contained:{ boxShadow:'none', '&:hover':{ boxShadow:'none' } } } },
      MuiCard:          { styleOverrides: { root:{ backgroundImage:'none', border:`1px solid ${c.border}` } } },
      MuiPaper:         { styleOverrides: { root:{ backgroundImage:'none' } } },
      MuiTableCell:     { styleOverrides: { head:{ fontWeight:700, background:c.appBar, color:c.textSec, borderColor:c.border }, body:{ borderColor:c.border } } },
      MuiTableRow:      { styleOverrides: { root:{ '&:nth-of-type(odd)':{ backgroundColor:'rgba(128,128,128,0.04)' } } } },
      MuiDivider:       { styleOverrides: { root:{ borderColor:c.border } } },
      MuiChip:          { styleOverrides: { root:{ fontWeight:600 } } },
      MuiAppBar:        { styleOverrides: { root:{ backgroundImage:'none', backgroundColor:c.appBar, borderBottom:`3px solid ${c.primary}` } } },
      MuiLinearProgress:{ styleOverrides: { root:{ backgroundColor:c.border } } },
      MuiOutlinedInput: { styleOverrides: { notchedOutline:{ borderColor:c.border } } },
      MuiAlert:         { styleOverrides: {
        root:            { backgroundImage:'none' },
        standardInfo:    { backgroundColor:'rgba(41,182,246,0.1)',  border:'1px solid rgba(41,182,246,0.3)' },
        standardSuccess: { backgroundColor:'rgba(76,175,80,0.1)',   border:'1px solid rgba(76,175,80,0.3)'  },
        standardWarning: { backgroundColor:'rgba(240,165,0,0.1)',   border:'1px solid rgba(240,165,0,0.3)'  },
        standardError:   { backgroundColor:'rgba(255,82,82,0.1)',   border:'1px solid rgba(255,82,82,0.3)'  },
      }},
    },
  });
}

// Theme context — components read BRAND from here
const ThemeColoursCtx = React.createContext(null);
function useBrand() { return React.useContext(ThemeColoursCtx); }

// Backwards compat — components that import BRAND directly still work via a mutable ref
// Updated by App root whenever theme changes
let BRAND = buildBrand(DEFAULT_THEME_COLOURS);

// ─── MODULE ACCENT COLOURS (dark-theme tuned) ─────────────────────────────────
const COL = {
  phishing:  { main: '#FF5252', light: 'rgba(255,82,82,0.12)',    dark: '#C62828' },
  passwords: { main: '#F0A500', light: 'rgba(240,165,0,0.12)',    dark: '#C07D00' },
  devices:   { main: '#26C6DA', light: 'rgba(38,198,218,0.12)',   dark: '#0097A7' },
  reporting: { main: '#AB47BC', light: 'rgba(171,71,188,0.12)',   dark: '#7B1FA2' },
};
function getCol(id) { return COL[id] || COL.phishing; }



// ─── ICON MAP (for serialisation) ────────────────────────────────────────────
const ICON_MAP = { PhishingIcon, LockIcon, DeviceIcon, ReportIcon };
const ICON_NAMES = Object.keys(ICON_MAP);
function resolveIcon(name) { return ICON_MAP[name] || PhishingIcon; }

// ─── QUESTION BANK STORAGE ───────────────────────────────────────────────────
const QB_KEY = 'cbt:qbank:v1';
function loadQBank() {
  try {
    const raw = localStorage.getItem(QB_KEY);
    if (!raw) return null;
    return JSON.parse(raw).map(m => ({ ...m, icon: resolveIcon(m.iconName) }));
  } catch { return null; }
}
function saveQBank(modules) {
  try {
    localStorage.setItem(QB_KEY, JSON.stringify(
      modules.map(({ icon, ...rest }) => ({
        ...rest,
        iconName: Object.entries(ICON_MAP).find(([,v]) => v === icon)?.[0] || 'PhishingIcon',
      }))
    ));
  } catch {}
}

// ─── DEFAULT MODULES (30 questions each) ─────────────────────────────────────
const DEFAULT_MODULES = [
  {
    id: 'phishing', title: 'Defending Against Phishing', icon: PhishingIcon,
    summary: 'Recognise and respond to phishing attacks — emails, texts and social engineering.',
    lessons: [
      'Phishing arrives by email, text, social media or phone. Mass campaigns target millions; spear phishing is tailored specifically to you.',
      'Tell-tale signs: urgency, unexpected requests, mismatched sender addresses, and links that don\'t go where they claim.',
      'Even careful users get caught. Training alone is not enough — combine it with technical defences and a no-blame reporting culture.',
      'Report suspicious emails at work to IT. At home, forward to report@phishing.gov.uk and texts to 7726.',
      'If you\'ve already clicked — disconnect from the network, change passwords from a clean device, and report immediately.',
    ],
    questions: [
      {type:'single',q:'According to NCSC guidance, which best describes phishing?',options:['A virus spreading via USB drives','Criminals tricking people into doing the wrong thing, such as clicking a malicious link','Hackers using brute-force tools on your network','Software secretly mining cryptocurrency'],answer:1,explainer:'The NCSC defines phishing as criminals attempting to trick people into doing the wrong thing.'},
      {type:'single',q:'Which is a recognised tell-tale sign of a phishing email?',options:['It comes from a known colleague','It has a company logo','It uses urgent language to pressure you','It is shorter than three sentences'],answer:2,explainer:'Urgency, authority and unexpected requests are the classic levers attackers use.'},
      {type:'single',q:'NCSC recommended action after clicking a suspicious link on a work device?',options:['Carry on and hope nothing happens','Reboot and clear browser history','Tell IT/security straight away — early reporting limits damage','Reply to the email to check if it was genuine'],answer:2,explainer:'Report immediately so the security team can act.'},
      {type:'single',q:'Spear phishing differs from ordinary phishing because it…',options:['Uses a phone call instead of email','Targets you specifically using personal or organisational details','Is always sent on weekends','Contains no links'],answer:1,explainer:'Spear phishing is tailored — attackers research the target.'},
      {type:'single',q:'Where should a UK member of the public forward a suspicious email?',options:['spam@google.com','report@phishing.gov.uk','abuse@ncsc.uk','fraud@actionfraud.com'],answer:1,explainer:'The NCSC Suspicious Email Reporting Service: report@phishing.gov.uk. Texts go to 7726.'},
      {type:'multi',q:'Select ALL techniques attackers commonly use in phishing emails:',options:['Creating a sense of urgency','Pretending to be a senior figure (authority)','Mimicking ongoing email threads','Always using poor spelling and grammar'],answer:[0,1,2],explainer:'Urgency, authority and thread-hijacking are all documented techniques. Modern phishing is often well-written.'},
      {type:'single',q:'An email from your CEO asks you to urgently buy gift cards. Right move?',options:['Buy them immediately','Verify out-of-band — phone the CEO on a known number first','Reply to confirm','Forward to a colleague to check'],answer:1,explainer:'Gift-card scams are classic BEC. Always verify unusual financial requests via a separate channel.'},
      {type:'single',q:'You receive a text from "your bank" asking you to confirm a payment via a link. NCSC advice:',options:['Click the link to check','Ignore it but stay logged in','Don\'t click — contact your bank via the number on the back of your card','Reply STOP to opt out'],answer:2,explainer:'Smishing uses urgency and links. Always contact the bank via a known channel.'},
      {type:'multi',q:'Which are warning signs a link might be malicious? (Select all)',options:['Visible text shows one domain but URL preview shows another','It uses a URL shortener in an unexpected business email','It includes an https:// padlock','The domain has unusual misspellings (e.g. micros0ft.com)'],answer:[0,1,3],explainer:'Mismatched URLs, unexpected shorteners and lookalike domains are classic signals. HTTPS only proves encryption.'},
      {type:'single',q:'Attachment called "Invoice_Q3.pdf.exe" arrives from an unknown sender. Safest response:',options:['Open it — PDFs are safe','Open it in a sandbox','Don\'t open it; report it. The double extension is a malware giveaway','Forward to colleagues to identify it'],answer:2,explainer:'Double extensions like .pdf.exe are a long-standing trick. Never open unexpected executables.'},
      {type:'single',q:'Why is "just teach staff to spot phishing" considered insufficient by the NCSC?',options:['Because staff can\'t be trusted','Because phishing is so convincing some attacks always get through — defences must be layered','Because phishing is no longer a threat','Because email will be replaced by chat'],answer:1,explainer:'NCSC says relying on user detection alone wastes time. Layered defences are recommended.'},
      {type:'multi',q:'Which BEHAVIOURS does NCSC recommend to make yourself a harder target? (Select all)',options:['Review privacy settings on your social media accounts','Think before posting personal details online','Publicly share your full date of birth and home town','Be cautious about emails asking you to click and log in'],answer:[0,1,3],explainer:'Review privacy settings, be careful what you post, and treat login-link emails with suspicion.'},
      {type:'single',q:'Finance team receive an email from a "supplier" saying their bank details have changed. First step:',options:['Update the bank details and pay next invoice','Telephone the supplier on a previously-known number to verify','Reply to the email asking them to confirm','Wait to see if other suppliers email too'],answer:1,explainer:'Invoice fraud is one of the most expensive BEC variants. Always verify payment-detail changes out-of-band.'},
      {type:'multi',q:'Actions to take IMMEDIATELY after entering your password on a phishing site? (Select all)',options:['Change the password from a different, trusted device','Tell IT / your security team','Check whether that password is reused on other accounts and change those too','Delete the email and tell no-one'],answer:[0,1,2],explainer:'Speed matters. Change the password from a clean device, report it, and rotate any reused passwords.'},
      {type:'single',q:'A QR code on a poster takes you to a login page asking for work credentials. Safest assumption:',options:['QR codes are safe by design','Treat it with the same suspicion as an email link — "quishing" is a known attack','It must be legitimate if printed on paper','Only scan if it is in a public place'],answer:1,explainer:'"Quishing" (QR phishing) has risen sharply. Treat QR codes exactly like email links.'},
      {type:'single',q:'You spot a phishing email and a colleague received the same one. Most useful next step:',options:['Both delete it and move on','Both report it via your organisation\'s reporting route — patterns help defenders','Forward it to the whole company as a warning','Reply to the attacker asking them to stop'],answer:1,explainer:'Multiple reports give the security team faster signal. Report through proper channels.'},
      {type:'multi',q:'Which would NCSC consider RED FLAGS in a "HR" email asking you to update bank details? (Select all)',options:['It arrives just before payday','The link goes to a non-corporate domain','It threatens your salary will be delayed if you don\'t act today','It is signed by your actual line manager'],answer:[0,1,2],explainer:'Timing pressure, off-domain links and threats of consequence are textbook phishing markers.'},
      {type:'single',q:'Which is the BEST definition of "whaling"?',options:['A denial-of-service attack on shipping companies','Phishing aimed specifically at senior executives or high-value targets','An attack using very large attachments','A type of ransomware'],answer:1,explainer:'Whaling is targeted phishing aimed at big fish — executives and board members.'},
      {type:'single',q:'You are not sure if an email is phishing. The right NCSC-aligned reaction:',options:['Click the link only on your phone','Report it through your organisation\'s route — false alarms are welcome','Forward it to friends to ask their opinion','Open the attachment in a different program'],answer:1,explainer:'NCSC actively encourages over-reporting. False positives are the cost of a healthy reporting culture.'},
      {type:'multi',q:'Select ALL signs a phishing email is trying to manipulate you into acting without thinking:',options:['Subject line: "URGENT ACTION REQUIRED"','Email claims your account will be closed in 24 hours','Email is from a name you recognise but the reply-to address is different','Email contains your full name and job title'],answer:[0,1,2],explainer:'Urgency, account-closure threats and mismatched reply addresses are classic manipulation techniques.'},
      {type:'single',q:'An attacker calls you pretending to be IT support and asks for your password. This is called:',options:['Vishing (voice phishing)','Smishing','Baiting','Pretexting only when in person'],answer:0,explainer:'Vishing is voice-based social engineering. NCSC: never give passwords to anyone by phone.'},
      {type:'multi',q:'Which of the following are legitimate ways to verify a suspicious link is safe? (Select all)',options:['Hover over it to compare the visible text with the actual URL','Paste into a URL scanner such as Google Safe Browsing or VirusTotal','Click quickly so the page loads before malware can activate','Ask a colleague to click it first to check'],answer:[0,1],explainer:'Hover and scan are safe verification methods. Clicking — fast or via someone else — is not.'},
      {type:'single',q:'What is a "homograph attack" in the context of phishing?',options:['Sending the same email to millions of people','Using visually similar letters from different alphabets to mimic a trusted domain','Hacking into a printer to intercept documents','Phishing via printed letters through the post'],answer:1,explainer:'Homograph attacks use visually identical characters (e.g. Cyrillic "а" instead of Latin "a") to create convincing lookalike domains.'},
      {type:'single',q:'Your organisation\'s domain has no DMARC record. This means:',options:['Emails cannot be sent externally','Attackers can spoof your domain more easily in phishing emails','All emails are automatically encrypted','Staff cannot receive external emails'],answer:1,explainer:'DMARC, DKIM and SPF records help prevent domain spoofing. NCSC\'s Mail Check service helps UK organisations configure them.'},
      {type:'multi',q:'Which email security standards should UK organisations implement? (Select all)',options:['SPF (Sender Policy Framework)','DKIM (DomainKeys Identified Mail)','DMARC (Domain-based Message Authentication)','POP3 (Post Office Protocol)'],answer:[0,1,2],explainer:'SPF, DKIM and DMARC prevent spoofed emails. POP3 is an email retrieval protocol, not a security standard.'},
      {type:'single',q:'What is "thread hijacking" in the context of phishing?',options:['Physically cutting network cables','Attackers inserting malicious messages into existing email threads to appear legitimate','Redirecting a forum thread to a phishing site','Hijacking a phone call mid-conversation'],answer:1,explainer:'Thread hijacking inserts the attacker into a real ongoing email conversation, dramatically increasing believability.'},
      {type:'multi',q:'Your organisation can reduce phishing risk by implementing which controls? (Select all)',options:['Filtering inbound email for malicious links and attachments','Enabling multi-factor authentication on all email accounts','Using NCSC\'s Mail Check service to assess your email configuration','Allowing all staff to use personal email for work to reduce load on corporate systems'],answer:[0,1,2],explainer:'Filtering, MFA and proper email DNS configuration are all NCSC-recommended technical controls. Personal email bypasses all controls.'},
      {type:'single',q:'After a successful phishing attack on your organisation, NCSC recommends:',options:['Quietly fix the issue and tell no-one to avoid reputational damage','Report to NCSC, conduct a lessons-learned review, and update controls','Immediately fire the member of staff who clicked the link','Change everyone\'s passwords and say nothing else'],answer:1,explainer:'Reporting, learning and improving controls is the NCSC approach. Blame and concealment make future incidents more likely.'},
      {type:'single',q:'A colleague forwards you an email with "FWD: FWD: URGENT" in the subject and asks you to share widely. This is most likely:',options:['A legitimate urgent notice','A chain email or hoax — these often spread misinformation and occasionally malware','A government emergency alert','Evidence of a data breach'],answer:1,explainer:'Chain emails spread hoaxes and occasionally malware. Do not forward; report to IT if in doubt.'},
      {type:'multi',q:'Select ALL that are signs a phishing email is trying to manipulate you into acting without thinking:',options:['It asks you to "verify your account" by clicking a link and logging in','It claims to be from a service you use but the sender domain is different','It is well-written and uses your correct name and job title','It threatens legal action if you don\'t respond within 24 hours'],answer:[0,1,3],explainer:'Account-verification requests, mismatched domains and legal threats are manipulation techniques. Personalisation alone is not.'},
    ],
  },
  {
    id: 'passwords', title: 'Using Strong Passwords', icon: LockIcon,
    summary: 'Create strong, unique passwords and use a second factor to protect your accounts.',
    lessons: [
      'Use three random words — for example BicycleMustardVolcano. Long enough to resist cracking, easy enough to remember.',
      'Avoid words drawn from your social media (pet names, birthdays, sports teams). Attackers harvest these.',
      'Use separate passwords for important accounts — at minimum your work account, primary email and banking.',
      'Save passwords in a reputable password manager or your browser. This is safer than reusing weak ones.',
      'Switch on 2-step verification (2SV / MFA) wherever it is offered, especially for email.',
    ],
    questions: [
      {type:'single',q:'What approach to password creation does the NCSC actively recommend?',options:['Eight characters with a number, symbol and capital letter','Three random words combined into a passphrase','Your child\'s name followed by your year of birth','A different password rotated every 30 days'],answer:1,explainer:'The NCSC\'s #thinkrandom guidance promotes three random words — long enough to resist cracking, easy enough to remember.'},
      {type:'single',q:'Why does the NCSC discourage forced complexity rules (mandatory symbols, numbers, capitals)?',options:['They look ugly when printed','They produce more predictable passwords because users fall back on patterns','They are banned by GDPR','They take too long to type'],answer:1,explainer:'Complexity rules push people toward predictable variations like Password1!, which attackers expect.'},
      {type:'single',q:'Which account most needs its own unique password and 2-step verification?',options:['Your supermarket loyalty card','An old forum you haven\'t used in years','Your primary personal email address','A streaming service you share with family'],answer:2,explainer:'Email is the recovery route for almost every other account. NCSC singles it out as highest priority.'},
      {type:'single',q:'Which is the SAFEST way to handle dozens of strong, unique passwords?',options:['Write them on a sticky note under your keyboard','Use the same password but change one digit each time','Store them in a reputable password manager','Memorise one long password and reuse it'],answer:2,explainer:'Password managers beat reuse every time.'},
      {type:'single',q:'What does 2-step verification (2SV) add to your account?',options:['A second password to remember','An extra check — usually a code or prompt — in addition to your password','An automatic password reset every week','A backup copy of your data'],answer:1,explainer:'2SV requires a second factor so a stolen password alone is not enough.'},
      {type:'multi',q:'Which of these are GOOD password choices by NCSC criteria? (Select all)',options:['BicycleMustardVolcano','Password123!','ThunderPaperclipOcean','JohnSmith1985'],answer:[0,2],explainer:'Three random, unrelated words make long passwords that are hard to crack. Personal references and patterns are weak.'},
      {type:'single',q:'Why does NCSC say "don\'t pick words from your social media" for passwords?',options:['It\'s against GDPR','Attackers harvest names of pets, children and sports teams for guessing attacks','It uses too much memory','Search engines rank such passwords lower'],answer:1,explainer:'Attackers build personalised wordlists from social profiles.'},
      {type:'multi',q:'Which accounts does NCSC advise should each have their own UNIQUE password? (Select all)',options:['Your work account','Your primary personal email','Online banking','Every newsletter you sign up to'],answer:[0,1,2],explainer:'NCSC prioritises high-value accounts: work, primary email, banking.'},
      {type:'single',q:'Your password manager needs a master password. NCSC says:',options:['Use a short PIN to make it quick','Use a strong passphrase — three random words — and turn on 2SV for the manager itself','Use the same password as your email','Don\'t bother — managers protect themselves'],answer:1,explainer:'The master password is the keys to the kingdom. NCSC recommends a three-random-word passphrase plus 2SV.'},
      {type:'single',q:'An attacker tries every word in the dictionary against your account. This attack is called:',options:['A phishing attack','A man-in-the-middle attack','A dictionary attack (a form of brute force)','A SQL injection'],answer:2,explainer:'Dictionary attacks try common words and known leaked passwords. Long, random passphrases defeat this.'},
      {type:'multi',q:'Which 2-step verification methods are GENERALLY considered stronger? (Select all)',options:['Authenticator app (TOTP) codes','Hardware security key (FIDO2 / passkey)','SMS text-message codes','Security questions like "mother\'s maiden name"'],answer:[0,1],explainer:'Authenticator apps and hardware keys resist SIM-swap and phishing better than SMS. Security questions are weak.'},
      {type:'single',q:'A site forces a 90-day password rotation. NCSC\'s modern guidance:',options:['Frequent rotation always improves security','Forced regular rotation tends to produce weaker, more predictable passwords','Passwords should change every 24 hours','Rotation is mandatory under UK law'],answer:1,explainer:'NCSC moved away from forced rotation — it pushes users toward predictable patterns.'},
      {type:'single',q:'You are told a service you use has been breached. NCSC-aligned response:',options:['Ignore it — breaches happen all the time','Change the password on that service, and on any other account where you reused it','Delete the account and the email linked to it','Stop using the internet'],answer:1,explainer:'Reuse is the real danger after a breach. Change the affected password and any reused accounts.'},
      {type:'single',q:'A colleague asks for your password to "just sort something quickly". The right answer:',options:['Tell them — they are trusted','Write it on a sticky note for them','Refuse — passwords must never be shared, and IT can grant proper access','Tell them only the first half'],answer:2,explainer:'Passwords are personal. Shared access should be granted via proper IT mechanisms.'},
      {type:'multi',q:'Select EVERY weak password choice in this list:',options:['Liverpool2026','qwerty','TurboSnailYellow','Summer!1'],answer:[0,1,3],explainer:'Sports + year, keyboard runs and seasonal patterns appear on every cracking list. Three random words is the only strong one.'},
      {type:'single',q:'Browsers offer to save passwords. NCSC\'s view:',options:['Never let a browser save passwords','It is broadly safer than reusing weak passwords — useful for people who won\'t use a dedicated manager','Browser-saved passwords are uncrackable','Only Chrome\'s password store is acceptable'],answer:1,explainer:'NCSC explicitly says browser-stored passwords beat reuse.'},
      {type:'single',q:'What is a passkey?',options:['A really long password','A cryptographic credential stored on your device that replaces the password and resists phishing','A password manager','A type of CAPTCHA'],answer:1,explainer:'Passkeys (FIDO2) are phishing-resistant, no shared secret, easy to use — NCSC\'s direction of travel.'},
      {type:'single',q:'Which is the most important account-recovery hygiene step?',options:['Add a backup phone number to every account','Keep your primary email locked down — strong unique password + 2SV — because it controls all other resets','Disable account recovery entirely','Use the same recovery question everywhere'],answer:1,explainer:'Compromise of email lets attackers reset everything else. Lock it down first.'},
      {type:'single',q:'You are shoulder-surfed entering a password on a train. The right action:',options:['Do nothing — they probably didn\'t see','Change that password as soon as you can do so on a trusted network','Change it later only if money goes missing','Ask them what they saw'],answer:1,explainer:'If a password may have been observed, treat it as compromised.'},
      {type:'multi',q:'Which password-related behaviours are recommended by NCSC? (Select all)',options:['Use a unique password for every important account','Turn on MFA wherever it is offered','Write passwords on a whiteboard in the office','Use a password manager to generate and store strong passwords'],answer:[0,1,3],explainer:'Unique passwords, MFA, and a password manager form the NCSC\'s recommended trio.'},
      {type:'single',q:'What is "credential stuffing"?',options:['Filling in a form with fake details','Automatically trying username/password pairs from one breach against other services','Physically stuffing a USB drive into a server','A brute-force attack on Wi-Fi passwords'],answer:1,explainer:'Credential stuffing exploits password reuse. Unique passwords per site defeat it completely.'},
      {type:'multi',q:'Which of these make your password manager more secure? (Select all)',options:['Strong master passphrase (three random words)','2-step verification on the manager account','Sharing the master password with your IT admin','Enabling biometric unlock as a convenient alternative'],answer:[0,1,3],explainer:'Strong master password, 2SV, and biometric unlock all increase security. Sharing the master password defeats the purpose.'},
      {type:'single',q:'What length of passphrase does NCSC consider adequate for most purposes?',options:['6 characters or more','8 characters with complexity rules','At least three random words (typically 15–20 characters)','Exactly 12 characters with mixed case'],answer:2,explainer:'Three random words typically produces 15–20 characters — far more resistant to cracking than 8-character complex passwords.'},
      {type:'single',q:'What is SIM swapping and why is it relevant to account security?',options:['Moving your SIM card to a new phone legitimately','An attack where criminals persuade your mobile carrier to transfer your number to their SIM, intercepting SMS 2FA codes','A method of backing up your contacts via SIM','Swapping between different mobile networks for better coverage'],answer:1,explainer:'SIM swapping lets attackers receive SMS 2FA codes. NCSC recommends app-based or hardware-key 2FA to defeat this.'},
      {type:'multi',q:'After a colleague reports their account is compromised, which actions should IT take? (Select all)',options:['Immediately reset the account password','Revoke all active sessions / tokens','Check audit logs for what was accessed','Wait to see if the problem resolves itself'],answer:[0,1,2],explainer:'Immediate password reset, session revocation and audit-log review are the NCSC incident response basics.'},
      {type:'single',q:'NCSC\'s guidance on storing passwords in plain text (e.g. a spreadsheet on your desktop):',options:['Fine if the spreadsheet is password-protected','Acceptable for low-value accounts only','Avoid — use a password manager instead; plain text is readable by anyone who accesses the file','Required for easy recovery'],answer:2,explainer:'Plain-text credential stores are a major risk. Password managers encrypt your vault.'},
      {type:'single',q:'You are setting up a new work account and the system insists on a 10-character password with complexity rules. You should:',options:['Use your usual password with a number added','Pick three short random words and add a digit to satisfy the rule','Use your name and current year','Reuse the same password as your email'],answer:1,explainer:'Even within complexity constraints, aiming for length (three words) beats predictable patterns.'},
      {type:'single',q:'A website stores passwords using bcrypt hashing. This is better than plain text because:',options:['bcrypt makes passwords invisible on screen','bcrypt is a one-way function — even if the database is stolen, passwords cannot easily be reversed','bcrypt automatically resets passwords every 90 days','bcrypt is required by UK law for government sites'],answer:1,explainer:'Strong hashing means a stolen database reveals only hashes, not passwords.'},
      {type:'multi',q:'Which of the following are acceptable alternatives to a full password for unlocking devices? (Select all)',options:['A fingerprint or Face ID biometric','A strong PIN (not a short obvious one)','Leaving the device unlocked at all times for convenience','A passphrase typed each time'],answer:[0,1,3],explainer:'Biometrics, strong PINs and passphrases are all acceptable. Leaving devices unlocked is never acceptable.'},
      {type:'single',q:'What does NCSC\'s "Have I Been Pwned" equivalent service let you check?',options:['Whether your device has a virus','Whether your email address or password has appeared in a known breach','Whether your home Wi-Fi is secure','Whether someone is using your identity for fraud'],answer:1,explainer:'NCSC partners with HaveIBeenPwned.com, which lets you check if your credentials have been compromised in a breach.'},
    ],
  },
  {
    id: 'devices', title: 'Securing Your Devices', icon: DeviceIcon,
    summary: 'Keep phones, laptops and tablets secure with simple, effective habits.',
    lessons: [
      'Switch on automatic updates for your operating system and apps. Most attacks exploit known flaws that updates have already fixed.',
      'Lock your screen with a PIN, password or biometric, and set it to lock automatically when idle.',
      'Only install apps from official stores (Apple App Store, Google Play, Microsoft Store).',
      'Back up important data so a ransomware attack or lost device is an inconvenience, not a disaster.',
      'Treat public Wi-Fi with caution. For sensitive work, use mobile-data tethering or a trusted VPN provided by your organisation.',
    ],
    questions: [
      {type:'single',q:'Why does the NCSC place "switch on automatic updates" near the top of device-security advice?',options:['Updates make devices run faster','Most attacks exploit flaws that vendors have already patched','It is a legal requirement under UK law','It frees up storage space'],answer:1,explainer:'The vast majority of opportunistic attacks rely on unpatched vulnerabilities.'},
      {type:'single',q:'NCSC\'s stance on installing apps from unofficial "sideload" sources:',options:['Encouraged — you get more choice','Avoid — official app stores carry out checks that reduce malware risk','Fine if the app is free','Fine if a friend recommends it'],answer:1,explainer:'Official stores screen for malicious behaviour. Sideloaded apps bypass that protection.'},
      {type:'single',q:'Your laptop is stolen on the train. Which precaution makes the biggest difference?',options:['A sticker with your name on the lid','Disk encryption combined with a strong login password','A bright laptop case','An expensive insurance policy'],answer:1,explainer:'Full-disk encryption means the data is unreadable without your credentials.'},
      {type:'single',q:'Why are regular backups a key part of cyber resilience?',options:['They make computers run faster','They turn ransomware and lost devices into recoverable inconveniences','They are a legal requirement for all UK staff','They help with software updates'],answer:1,explainer:'If your data is backed up, you can refuse to pay a ransomware demand and restore from a clean copy.'},
      {type:'single',q:'Sending a sensitive document while working from a café. NCSC guidance:',options:['Just use the café Wi-Fi','Use mobile data tethering or a trusted VPN rather than open Wi-Fi','Email the file to your personal Gmail first','Put the file on a USB stick and post it'],answer:1,explainer:'Open Wi-Fi networks can be observed or spoofed. Tethering or a trusted VPN is far safer.'},
      {type:'multi',q:'Which are NCSC-recommended baseline device habits? (Select all)',options:['Auto-lock the screen after a short idle period','Use biometric or PIN/password lock','Allow anyone to use guest mode on your work laptop','Apply security updates as soon as available'],answer:[0,1,3],explainer:'Auto-lock, biometrics/PIN and prompt updates are the trio of baseline habits.'},
      {type:'single',q:'A USB stick appears on your desk with no note. NCSC guidance:',options:['Plug it in to find out who it belongs to','Don\'t plug it in — hand it to IT/security','Format it and reuse it','Plug it into a colleague\'s machine'],answer:1,explainer:'Mystery USBs have been used to drop malware. Don\'t plug it in — escalate.'},
      {type:'single',q:'What does "find my device" / remote wipe give you?',options:['Faster downloads','The ability to locate, lock or erase a lost device — limiting data exposure','A backup of your messages','A discount from the manufacturer'],answer:1,explainer:'Remote lock/wipe is one of the most effective controls if a device goes missing.'},
      {type:'multi',q:'Which would NCSC consider a SAFE backup pattern? (Select all)',options:['An always-connected USB drive that mirrors your laptop continuously','Cloud backup with strong account security and 2SV','An offline backup disconnected when not in use','Multiple copies, in different places, with at least one offline'],answer:[1,2,3],explainer:'An always-connected backup is encrypted by ransomware along with your live data. Use 3-2-1: multiple copies, multiple media, one offline.'},
      {type:'single',q:'An app asks for permissions that don\'t match its purpose (e.g. a calculator wanting your contacts). Right reaction:',options:['Grant — the developer must need it','Decline; consider whether the app is trustworthy at all','Grant, then revoke later','Always grant just in case'],answer:1,explainer:'Excessive permissions are a common malware tell. Decline and reconsider whether you trust the app.'},
      {type:'single',q:'End-of-life software (no longer receiving security updates) on a work device:',options:['Fine if it still works','A risk — known vulnerabilities will not be patched; should be replaced or isolated','Better than newer software because it is stable','Only a problem for servers'],answer:1,explainer:'Unsupported software accumulates unpatched flaws. NCSC says: replace, upgrade, or isolate.'},
      {type:'single',q:'A pop-up tells you your computer is infected and to call a number. NCSC advice:',options:['Call them quickly','Don\'t call. Close the browser and run a scan; report the incident','Pay them to remove the virus','Forward the pop-up to a friend'],answer:1,explainer:'Tech-support scams use scary pop-ups. Real Microsoft/Apple support never works that way.'},
      {type:'multi',q:'Public Wi-Fi cautions per NCSC. Select ALL good practice:',options:['Avoid logging into sensitive services on untrusted Wi-Fi','Prefer mobile-data tethering for sensitive work','Use a trusted VPN provided by your organisation','Trust any network whose name matches the venue'],answer:[0,1,2],explainer:'Network names are trivial to spoof. Avoid sensitive logins on open Wi-Fi; tether or VPN.'},
      {type:'single',q:'Why does NCSC recommend biometrics (Face ID, fingerprint) on phones and laptops?',options:['They are unhackable','They make strong device locks convenient enough to actually use','They replace the need for any other security','They speed up the processor'],answer:1,explainer:'Biometrics make a strong local-device lock effortless, so people actually leave it switched on.'},
      {type:'single',q:'You receive a security update notification just before a meeting. Right approach:',options:['Postpone indefinitely','Apply at the next safe opportunity — same day if practical — and never delay critical patches long','Disable updates so it never bothers you again','Only update once a year'],answer:1,explainer:'Updates close known flaws. Short delays are reasonable; indefinite delays are not.'},
      {type:'multi',q:'Which are signs your device may have been compromised? (Select all)',options:['Sudden battery drain or overheating','Unfamiliar apps you did not install','Browser homepage or default search engine has changed','A recent OS update was installed by IT'],answer:[0,1,2],explainer:'Battery anomalies, unknown apps and hijacked browser settings are classic compromise indicators.'},
      {type:'single',q:'A file from an unknown sender claims to be a "shared document". Best practice:',options:['Open it — cloud services scan everything','Verify with the supposed sender via a separate channel before opening','Forward to a colleague to open instead','Open in private browsing mode'],answer:1,explainer:'Cloud-share lures are a major phishing vector. Confirm out-of-band before opening anything unexpected.'},
      {type:'single',q:'Disposing of an old work phone or laptop. The correct sequence:',options:['Throw it in the bin','Sign out of accounts, factory-reset and hand back to IT for secure wipe and disposal','Sell it on a marketplace site as-is','Give it to a family member without resetting'],answer:1,explainer:'Sign out, reset, and follow your org\'s disposal route — usually back to IT.'},
      {type:'multi',q:'Which of these are part of a good personal cyber security routine for devices? (Select all)',options:['Keep the OS and apps up to date','Enable full-disk encryption','Use a screen lock with auto-lock enabled','Leave Bluetooth and Wi-Fi on at all times in public'],answer:[0,1,2],explainer:'Patching, encryption and screen lock are the core trio. Leaving Bluetooth/Wi-Fi on in public increases your attack surface.'},
      {type:'single',q:'You accidentally install a suspicious app. The first step is:',options:['Leave it and see if anything bad happens','Uninstall it immediately, run an antivirus scan, and report to IT if on a work device','Tell a friend','Post about it on social media'],answer:1,explainer:'Remove the threat, scan, and for work devices — report. Early action limits potential damage.'},
      {type:'single',q:'What is the primary purpose of full-disk encryption on a laptop?',options:['To make the laptop boot faster','To ensure data cannot be read without the correct credentials, even if the drive is removed','To prevent viruses from infecting the operating system','To back up data automatically to the cloud'],answer:1,explainer:'Full-disk encryption protects data at rest. Without the encryption key, the drive is unreadable.'},
      {type:'single',q:'Which NCSC certification scheme helps UK organisations confirm basic security controls are in place?',options:['ISO 27001','Cyber Essentials','SOC 2','PCI DSS'],answer:1,explainer:'Cyber Essentials is the UK government-backed scheme covering five key controls including software updates, secure configuration, and malware protection.'},
      {type:'multi',q:'Cyber Essentials covers which of the following technical controls? (Select all)',options:['Firewalls and internet gateways','Secure configuration','Malware protection','Penetration testing'],answer:[0,1,2],explainer:'Cyber Essentials covers five controls: firewalls, secure configuration, access control, malware protection and patch management. Penetration testing is beyond its scope.'},
      {type:'single',q:'What is "shadow IT"?',options:['IT systems operated after dark','Software or services used by staff without IT department approval or knowledge','A type of screen dimming technology','Backup copies of official IT systems'],answer:1,explainer:'Shadow IT bypasses security controls. Staff using personal Dropbox, WhatsApp or unapproved cloud tools for work data creates significant risk.'},
      {type:'multi',q:'Which actions should be taken when a work device is reported lost or stolen? (Select all)',options:['Report to IT/security immediately','Use remote lock/wipe via the device management system','Change passwords for accounts accessed on that device','Wait a few days to see if the device turns up'],answer:[0,1,2],explainer:'Speed matters: report, remote lock/wipe, and change passwords. Waiting allows attackers time to exploit access.'},
      {type:'single',q:'Your organisation issues laptops with a Mobile Device Management (MDM) system. This allows IT to:',options:['Read all your personal messages on the device','Remotely wipe, enforce policies and push security updates to the device','Charge you for apps you install','Monitor your personal browsing on home networks'],answer:1,explainer:'MDM lets IT enforce security policies, push updates, and remotely wipe devices if lost.'},
      {type:'multi',q:'Which are NCSC-aligned remote working security practices? (Select all)',options:['Use a VPN provided by your employer for accessing work systems','Lock your screen whenever you step away from your device','Avoid discussing sensitive matters in public spaces where you may be overheard','Connect to public Wi-Fi to conserve mobile data when working on sensitive documents'],answer:[0,1,2],explainer:'VPN, screen locking and physical/audio security are all NCSC remote-working recommendations.'},
      {type:'single',q:'What is "jailbreaking" or "rooting" a smartphone?',options:['Reporting a lost phone to the police','Removing manufacturer restrictions to gain full administrative control of the device — bypassing security controls','Resetting a phone to factory settings','Setting up parental controls'],answer:1,explainer:'Jailbreaking/rooting bypasses security controls, exposing the device to malware. NCSC strongly advises against it on work devices.'},
      {type:'single',q:'A colleague has disabled Windows Defender on their work laptop because it "slows things down". This is:',options:['Acceptable — performance matters','A significant risk — antivirus should be on by default and not disabled without IT approval','Only a problem if they visit risky websites','Fine on a home network'],answer:1,explainer:'Disabling antivirus software is a policy violation in most organisations and a significant security risk.'},
      {type:'single',q:'What should you do if you notice your work device\'s battery drains unusually quickly after visiting an unknown website?',options:['Charge it more often — battery health degrades over time','Assume it is nothing — websites cannot affect battery life','Report to IT — unusual battery drain can indicate malware running in the background','Immediately destroy the device'],answer:2,explainer:'Unusual battery drain can indicate malware or cryptomining. Report to IT for investigation.'},
    ],
  },
  {
    id: 'reporting', title: 'Reporting Incidents', icon: ReportIcon,
    summary: 'Know when and how to report — early reporting contains damage.',
    lessons: [
      'Anyone can be tricked. The NCSC\'s organisational guidance explicitly calls for a no-blame reporting culture.',
      'Know your route in advance: who do you ring or message first if something looks wrong? Save that contact in your phone today.',
      'Report suspected phishing, lost devices, accidental data sharing, or anything unusual — even if you\'re not sure it matters.',
      'For UK fraud, contact Action Fraud on 0300 123 2040 (or 101 in Scotland). For incidents at organisations, follow your local IR plan.',
      'After reporting, write down what happened while it\'s fresh: dates, times, what you saw, what you clicked.',
    ],
    questions: [
      {type:'single',q:'NCSC\'s headline message about staff who think they may have made a security mistake:',options:['They should be disciplined to discourage repeat errors','They should hide the mistake to avoid embarrassment','They should report it immediately — a no-blame culture is essential','They should fix it themselves before telling anyone'],answer:2,explainer:'Punishing reporters destroys the early-warning system that protects everyone.'},
      {type:'multi',q:'Which of these incidents are worth reporting per NCSC guidance? (Select all)',options:['A suspicious email you did not click','A lost work phone','An email you accidentally sent to the wrong person','Spotting a colleague leaving their laptop unlocked at a coffee shop'],answer:[0,1,2,3],explainer:'All of these are reportable. Early visibility lets the security team contain issues and spot patterns.'},
      {type:'single',q:'Where should a UK individual or small business report fraud (including cyber-enabled fraud)?',options:['Action Fraud on 0300 123 2040','Their local council','The Information Commissioner\'s Office','Companies House'],answer:0,explainer:'Action Fraud is the UK\'s national reporting centre for fraud and cyber crime.'},
      {type:'single',q:'Why does the NCSC recommend writing down what happened straight after an incident?',options:['To create evidence for a court case','Because memory fades quickly and accurate timelines help responders','It is a legal requirement','To share on social media'],answer:1,explainer:'Detailed timelines speed up investigation. Recording while it\'s fresh is one of the most useful things a non-technical staff member can do.'},
      {type:'single',q:'You report a phishing click and the security team confirms it was nothing. What is the right takeaway?',options:['Stop reporting things to avoid wasting their time','Good — you did exactly what NCSC guidance asks for','Apologise and request training','Forward the email to colleagues as a warning'],answer:1,explainer:'False alarms are a healthy sign of an engaged workforce. NCSC wants people to err on the side of reporting.'},
      {type:'single',q:'Under UK GDPR, a personal data breach must be reported to the ICO (where required) within:',options:['24 hours','72 hours of becoming aware of it','7 days','1 month'],answer:1,explainer:'The 72-hour ICO notification window is a legal duty for organisations.'},
      {type:'multi',q:'What information helps incident responders most when you report? (Select all)',options:['Date and time you noticed it','What exactly you saw or clicked','Whether you typed any credentials','Your colleagues\' opinions about IT'],answer:[0,1,2],explainer:'Timeline, observed behaviour and any credential exposure are critical. Editorial commentary is not.'},
      {type:'single',q:'You think a colleague\'s account has been compromised — they\'re sending odd messages. Right action:',options:['Reply to the odd message asking what is going on','Tell IT/security via a known channel and let the colleague know separately, in person or by phone','Forward the messages to the whole team','Ignore it and hope it stops'],answer:1,explainer:'Account takeovers spread fast. Fast reporting, plus contacting the person via a different channel, contains damage.'},
      {type:'multi',q:'Which behaviours show a healthy "speak-up" security culture? (Select all)',options:['Senior leaders openly thanking people who report mistakes','Treating false alarms as a positive sign','Naming and shaming individuals who fall for phishing','Sharing anonymised lessons learned across the organisation'],answer:[0,1,3],explainer:'Praise reporters, treat false alarms as health indicators, share lessons. Naming and shaming destroys reporting cultures.'},
      {type:'single',q:'A scammer pressures you NOT to tell anyone — "or you\'ll be in trouble". This is itself a sign of:',options:['Genuine concern from a senior person','An attack technique designed to delay reporting and increase damage','Standard banking procedure','Routine GDPR practice'],answer:1,explainer:'Isolating victims is a classic scam tactic. The instruction to keep quiet is itself a red flag.'},
      {type:'single',q:'What is the role of an Incident Response (IR) plan?',options:['A document nobody ever reads','A pre-agreed playbook for who does what when something goes wrong — practised before it is needed','A list of staff who should be fired after an incident','A spreadsheet of antivirus subscriptions'],answer:1,explainer:'NCSC strongly recommends practising IR plans so the first time you use it isn\'t a real crisis.'},
      {type:'single',q:'What is "Exercise In A Box"?',options:['A free NCSC tool for organisations to practise their cyber response in a safe environment','A training course for executives only','A piece of antivirus software','A government-issued laptop'],answer:0,explainer:'"Exercise In A Box" is NCSC\'s free service letting any UK organisation rehearse incident response scenarios.'},
      {type:'single',q:'After an incident is contained, NCSC recommends:',options:['Forgetting about it as quickly as possible','Conducting a blameless lessons-learned review and updating training and processes','Firing whoever clicked the link','Disabling email entirely'],answer:1,explainer:'The post-incident review is where most of the lasting value comes from. Blameless reviews drive systemic improvement.'},
      {type:'multi',q:'Which signals justify reporting even when you are "not sure it is serious"? (Select all)',options:['Something on your screen behaved unexpectedly','An email asks for credentials in an unusual way','A device behaves oddly after a recent click','You clicked a link and immediately regretted it'],answer:[0,1,2,3],explainer:'All four are reportable. NCSC repeatedly stresses: when in doubt, report.'},
      {type:'single',q:'A ransomware note appears on a colleague\'s screen. NCSC first-step guidance:',options:['Pay the ransom immediately','Disconnect the device from the network and report to IT/security urgently — do not pay','Reboot the machine','Reformat the disk'],answer:1,explainer:'Disconnect (to stop spread), preserve evidence, report. NCSC and Action Fraud both advise against paying ransoms.'},
      {type:'multi',q:'Which of these are appropriate UK reporting routes? (Select all)',options:['Action Fraud (0300 123 2040) for fraud','Police 101 for fraud in Scotland','Your organisation\'s IT/security team for workplace incidents','Posting publicly on social media to shame the attacker'],answer:[0,1,2],explainer:'Action Fraud, 101 (Scotland) and your internal IT/security route are the right channels. Public posts can hinder investigation.'},
      {type:'single',q:'You CC\'d a sensitive spreadsheet to the wrong external recipient. The right first move:',options:['Hope they don\'t notice','Recall the email and tell no-one','Report it immediately to your line manager / IT — early reporting allows data-protection mitigations','Ask the recipient to delete it'],answer:2,explainer:'Misdirected emails are a leading cause of personal-data breaches. Early reporting is what allows the organisation to meet its 72-hour ICO duty.'},
      {type:'multi',q:'Today, before any incident happens, which are NCSC-aligned things to do? (Select all)',options:['Save your IT/security team\'s contact in your phone','Know who to ring out of hours','Know how to report a suspicious email','Memorise the entire incident response plan word for word'],answer:[0,1,2],explainer:'Knowing the route in advance is the practical NCSC advice.'},
      {type:'single',q:'Your organisation doesn\'t have a "report phishing" button. NCSC\'s pragmatic suggestion:',options:['Don\'t bother reporting','Email the IT/security distribution list and forward the suspicious email as an attachment','Post on social media','Contact the sender'],answer:1,explainer:'Use whatever known IT channel exists. Forwarding as an attachment preserves headers — useful for analysis.'},
      {type:'single',q:'NCSC\'s "If in doubt, ___". Complete the phrase:',options:['log off','call it out','delete everything','ask Google'],answer:1,explainer:'"If in doubt, call it out" is the central message of NCSC\'s staff training.'},
      {type:'single',q:'Under UK GDPR, who is ultimately responsible for ensuring a data breach is reported to the ICO?',options:['The individual member of staff who caused the breach','The Data Protection Officer (DPO) or the organisation itself','The ICO notifies organisations — not the other way around','Action Fraud handles all data breach reports'],answer:1,explainer:'The organisation (and its DPO where appointed) has the legal duty to report qualifying breaches to the ICO within 72 hours.'},
      {type:'multi',q:'Which details should be included in an initial incident report? (Select all)',options:['When you first noticed the issue','What systems or data may be affected','What actions you have already taken','Your personal opinion on who is to blame'],answer:[0,1,2],explainer:'When, what (systems/data), and what you\'ve done are the key facts. Blame assessment is not part of an initial report.'},
      {type:'single',q:'What is "dwell time" in the context of cyber incidents?',options:['The time it takes to reboot a system after an attack','The time an attacker remains undetected inside a network between initial compromise and discovery','The amount of time staff spend on security training','The delay between a patch being released and being applied'],answer:1,explainer:'Long dwell times allow attackers to escalate privileges, exfiltrate data and deploy ransomware. Early detection and reporting reduces dwell time.'},
      {type:'single',q:'NCSC\'s guidance on paying ransomware demands:',options:['Pay quickly to minimise disruption','Never pay — NCSC and Action Fraud both strongly advise against payment, as it funds criminals and doesn\'t guarantee recovery','Pay only if the demand is under £10,000','Payment is the only option if backups are unavailable'],answer:1,explainer:'Payment funds criminal activity, doesn\'t guarantee decryption, and may attract further demands.'},
      {type:'multi',q:'Which of the following should be preserved (not altered) immediately after a cyber incident? (Select all)',options:['Log files from affected systems','The device or system in its current state (where safe to do so)','Email records related to the incident','The user\'s browser history from the past week, in case unrelated'],answer:[0,1,2],explainer:'Logs, device state and related emails are critical forensic evidence. Preserve them before making changes.'},
      {type:'single',q:'Which of the following best describes a "lessons learned" review after a cyber incident?',options:['A meeting to identify and punish those responsible','A blameless structured review that identifies what happened, why, and how to prevent recurrence','A financial review of the cost of the incident only','A press release for external publication'],answer:1,explainer:'NCSC advocates blameless post-incident reviews focused on systemic improvement, not individual blame.'},
      {type:'single',q:'What is NCSC\'s "Early Warning" service?',options:['Sending staff reminders to do their cyber training','Providing organisations with timely notifications of threats and vulnerabilities affecting their IP ranges','Broadcasting national emergency cyber alerts on TV','Automatically patching vulnerabilities for UK organisations'],answer:1,explainer:'NCSC\'s Early Warning service notifies UK organisations of indicators of compromise and vulnerabilities affecting their IP ranges — free to join.'},
      {type:'multi',q:'Which of the following are valid reasons to escalate an incident beyond your immediate IT team? (Select all)',options:['The attack appears to target critical operational systems','Personal data of customers or staff may have been accessed','The incident involves a third-party supplier\'s systems','You suspect it may have occurred more than two days ago'],answer:[0,1,2],explainer:'CNI impact, personal data exposure and supply chain involvement all warrant wider escalation.'},
      {type:'single',q:'An employee accidentally deletes a critical shared file used by 50 people. Is this a security incident?',options:['No — accidents are not security incidents','Yes — accidental data loss or unavailability is an incident and should be reported to IT','Only if the file contained personal data','Only if it cannot be recovered from backup'],answer:1,explainer:'Unintended data loss or unavailability is an incident. IT should be informed so they can assess impact and initiate recovery.'},
      {type:'single',q:'What is NCSC\'s guidance on "security by obscurity" (keeping security measures secret rather than making them robust)?',options:['It is sufficient on its own for most organisations','It should not be relied upon — security must be robust even when attackers know your defences','It is a legal requirement for government systems','It is the recommended approach for small businesses'],answer:1,explainer:'Security by obscurity alone is not sufficient. NCSC recommends designing systems to be secure even if the attacker knows the architecture.'},
    ],
  },
];

// ─── CONTEXT & MODULES HOOK ───────────────────────────────────────────────────
const ModulesCtx = React.createContext(null);
function useModules() { return React.useContext(ModulesCtx); }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function isCorrect(q, r) {
  if (q.type === 'multi') {
    if (!Array.isArray(r)) return false;
    return [...q.answer].sort().join(',') === [...r].sort().join(',');
  }
  return r === q.answer;
}
function moduleStats(attempts, id) {
  const a = attempts.filter(x => x.moduleId === id);
  if (!a.length) return { count:0, latest:null, best:null, avg:null, trend:'none' };
  const sorted = [...a].sort((x,y) => x.ts - y.ts);
  const latest = sorted[sorted.length-1].pct;
  const best = Math.max(...a.map(x=>x.pct));
  const avg = Math.round(a.reduce((s,x)=>s+x.pct,0)/a.length);
  let trend = 'flat';
  if (sorted.length >= 2) { const d = latest - sorted[sorted.length-2].pct; if (d>=5) trend='up'; else if (d<=-5) trend='down'; }
  return { count:a.length, latest, best, avg, trend };
}
function suggestNext(attempts, modules) {
  return modules.map(m => {
    const s = moduleStats(attempts, m.id);
    let score=0, reason='';
    if (!s.count)           { score=100; reason='Not yet started — complete this for your baseline.'; }
    else if (s.latest<60)   { score=90;  reason=`Last score ${s.latest}% — below the 60% pass mark.`; }
    else if (s.latest<80)   { score=70;  reason=`Last score ${s.latest}% — good, but room to improve.`; }
    else if (s.trend==='down'){score=60; reason='Your score dropped on the last attempt — worth a refresher.'; }
    else {
      const mAttempts = attempts.filter(x=>x.moduleId===m.id);
      const days = mAttempts.length ? Math.floor((Date.now()-Math.max(...mAttempts.map(x=>x.ts)))/86400000) : 0;
      score=20+Math.min(days,60); reason=days>30?`${days} days since last attempt — NCSC recommends regular refreshers.`:'Performing well here. Revisit in a few weeks.';
    }
    return { module:m, score, reason };
  }).sort((a,b)=>b.score-a.score);
}

// ─── SCORE CHIPS ──────────────────────────────────────────────────────────────
function ScoreChip({ pct }) {
  const color = pct>=80?'success':pct>=60?'warning':'error';
  return <Chip label={`${pct}%`} color={color} size="small" sx={{fontWeight:700,minWidth:52}}/>;
}
function TrendChip({ trend }) {
  if (trend==='up')   return <Chip icon={<TrendingUp sx={{fontSize:16}}/>}   label="Improving" color="success" size="small" variant="outlined"/>;
  if (trend==='down') return <Chip icon={<TrendingDown sx={{fontSize:16}}/>} label="Dropped"   color="error"   size="small" variant="outlined"/>;
  if (trend==='flat') return <Chip icon={<TrendingFlat sx={{fontSize:16}}/>} label="Steady"    color="default" size="small" variant="outlined"/>;
  return null;
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, body, onConfirm, onCancel, busy, confirmLabel='Confirm', confirmColor='error' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{display:'flex',alignItems:'center',gap:1}}><WarningIcon color={confirmColor}/>{title}</DialogTitle>
      <DialogContent><Typography>{body}</Typography></DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={busy}
          startIcon={busy?<CircularProgress size={14} color="inherit"/>:<DeleteIcon/>}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]             = useState('loading');
  const [user, setUser]             = useState(null);
  const [modId, setModId]           = useState(null);
  const [attempts, setAttempts]     = useState([]);
  const [certs, setCerts]           = useState([]);
  const [settings, setSettingsState]= useState(null);
  const [qIndex, setQIndex]         = useState(0);
  const [responses, setResponses]   = useState([]);
  const [quizStartedAt, setQuizStartedAt] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [snack, setSnack]           = useState({open:false,msg:'',sev:'success'});
  const [modules, setModules]       = useState(() => loadQBank() || DEFAULT_MODULES);
  const [resumeDialog, setResumeDialog] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const notifSeenRef = useRef(new Set());

  // Dynamic theme — load from localStorage, rebuild MUI theme live
  const [themeColours, setThemeColours] = useState(loadThemeColours);
  const activeTheme = useMemo(() => {
    BRAND = buildBrand(themeColours); // keep mutable ref in sync
    return buildTheme(themeColours);
  }, [themeColours]);

  function applyThemeColours(colours) {
    setThemeColours(colours);
    saveThemeColours(colours);
  }

  const showSnack = useCallback((msg, sev='success') => setSnack({open:true,msg,sev}), []);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    saveQBank(modules);
  }, [modules]);

  useEffect(() => {
    const u = api.getUser();
    if (u) {
      setUser(u);
      Promise.all([
        api.loadAttempts().catch(()=>[]),
        api.loadCertificates().catch(()=>[]),
        api.loadSettings().catch(()=>({})),
      ]).then(([a,c,s]) => { setAttempts(a); setCerts(c); setSettingsState(s||{}); });
      setView('dashboard');
    } else setView('auth');
  }, []);

  // ── NOTIFICATION POLLING ──────────────────────────────────────────────────
  // Builds notifications from live data — polls every 30s while logged in
  const buildNotifications = useCallback(async (currentUser, currentSettings, currentAttempts, currentModules) => {
    if (!currentUser || currentUser.status !== 'approved') return;
    const notifs = [];

    // 1. Admin: pending user approvals
    if (currentUser.role === 'admin') {
      try {
        const pending = await api.adminListPending();
        if (Array.isArray(pending) && pending.length > 0) {
          notifs.push({
            id: `pending-${pending.length}`,
            type: 'approval',
            severity: 'warning',
            title: `${pending.length} user${pending.length !== 1 ? 's' : ''} awaiting approval`,
            body: pending.map(u => u.displayName || u.username).join(', '),
            action: 'admin',
            icon: 'PersonAdd',
            ts: Date.now(),
          });
        }
      } catch {}
    }

    // 2. Overdue modules (deadline passed, not yet passed)
    const deadlines = currentSettings?.deadlines || {};
    const pm = currentSettings?.passMark ?? 60;
    const now = Date.now();
    for (const [moduleId, deadline] of Object.entries(deadlines)) {
      if (!deadline) continue;
      const dlMs = new Date(deadline).getTime();
      if (dlMs > now) continue; // not yet due
      const mod = (currentModules || []).find(m => m.id === moduleId);
      if (!mod) continue;
      const modAttempts = (currentAttempts || []).filter(a => a.moduleId === moduleId);
      const best = modAttempts.length ? Math.max(...modAttempts.map(a => a.pct)) : null;
      if (best !== null && best >= pm) continue; // already passed
      notifs.push({
        id: `overdue-${moduleId}`,
        type: 'deadline',
        severity: 'error',
        title: `Overdue: ${mod.title}`,
        body: `Deadline was ${new Date(deadline).toLocaleDateString('en-GB')}. Complete this module as soon as possible.`,
        action: 'learn',
        actionModuleId: moduleId,
        icon: 'Today',
        ts: dlMs,
      });
    }

    // 3. Modules due soon (within 7 days, not yet passed)
    for (const [moduleId, deadline] of Object.entries(deadlines)) {
      if (!deadline) continue;
      const dlMs = new Date(deadline).getTime();
      const daysLeft = Math.ceil((dlMs - now) / 86400000);
      if (daysLeft <= 0 || daysLeft > 7) continue;
      const mod = (currentModules || []).find(m => m.id === moduleId);
      if (!mod) continue;
      const modAttempts = (currentAttempts || []).filter(a => a.moduleId === moduleId);
      const best = modAttempts.length ? Math.max(...modAttempts.map(a => a.pct)) : null;
      if (best !== null && best >= pm) continue;
      notifs.push({
        id: `due-soon-${moduleId}`,
        type: 'deadline',
        severity: 'warning',
        title: `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}: ${mod.title}`,
        body: `Deadline: ${new Date(deadline).toLocaleDateString('en-GB')}. You haven't passed this module yet.`,
        action: 'learn',
        actionModuleId: moduleId,
        icon: 'Today',
        ts: dlMs,
      });
    }

    // 4. Unstarted modules reminder (if any modules never attempted)
    const unstartedMods = (currentModules || []).filter(m => !(currentAttempts || []).some(a => a.moduleId === m.id));
    if (unstartedMods.length > 0 && unstartedMods.length === (currentModules || []).length) {
      notifs.push({
        id: 'unstarted-all',
        type: 'info',
        severity: 'info',
        title: 'Get started with your training',
        body: `You haven't started any modules yet. Begin with ${unstartedMods[0]?.title}.`,
        action: 'dashboard',
        icon: 'School',
        ts: Date.now() - 86400000,
      });
    }

    // Sort: errors first, then warnings, then info; then by ts desc
    const order = { error: 0, warning: 1, info: 2 };
    notifs.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3) || b.ts - a.ts);

    setNotifications(notifs);

    // Toast any new notification not yet seen
    notifs.forEach(n => {
      if (!notifSeenRef.current.has(n.id)) {
        notifSeenRef.current.add(n.id);
        // Only toast errors and warnings (not info)
        if (n.severity === 'error' || n.severity === 'warning') {
          showSnack(n.title, n.severity === 'error' ? 'error' : 'warning');
        }
      }
    });
  }, [showSnack]);

  // Run on login and every 30s
  useEffect(() => {
    if (!user || user.status !== 'approved') return;
    buildNotifications(user, settings, attempts, modules);
    const interval = setInterval(() => buildNotifications(user, settings, attempts, modules), 30000);
    return () => clearInterval(interval);
  }, [user, settings, attempts, modules, buildNotifications]);

  async function onLogin(u) {
    // Block pending/rejected users — show appropriate screen
    if (u.status === 'pending') {
      setUser(u);
      setView('pending');
      return;
    }
    if (u.status === 'rejected') {
      showSnack('Your account registration has been declined. Please contact your administrator.', 'error');
      api.logout();
      return;
    }
    setUser(u);
    const [a,c,s] = await Promise.all([
      api.loadAttempts().catch(()=>[]),
      api.loadCertificates().catch(()=>[]),
      api.loadSettings().catch(()=>({})),
    ]);
    setAttempts(a); setCerts(c); setSettingsState(s||{});
    setView('dashboard');
  }
  function onLogout() { api.logout(); setUser(null); setAttempts([]); setCerts([]); setView('auth'); }

  async function startMod(id, mode='learn') {
    setModId(id);
    if (mode === 'quiz') {
      const saved = await api.loadProgress(id).catch(()=>null);
      if (saved && saved.qIndex > 0) { setResumeDialog(saved); return; }
      beginQuiz(id, 0, [], Date.now());
    } else {
      setView(mode);
    }
  }

  function beginQuiz(id, startIndex, startResponses, startedAt) {
    setModId(id); setQIndex(startIndex); setResponses(startResponses);
    setQuizStartedAt(startedAt); setResumeDialog(null); setView('quiz');
  }

  function goHome() { setView('dashboard'); setModId(null); }

  async function answer(r) {
    const nr = [...responses, r];
    setResponses(nr);
    const mod = modules.find(m=>m.id===modId);
    const nextIndex = qIndex + 1;
    await api.saveProgress(modId, nextIndex, nr, quizStartedAt).catch(()=>{});
    const qCount = settings?.questionCount || 30;
    if (nextIndex < Math.min(mod.questions.length, qCount)) { setQIndex(nextIndex); return; }

    const activeQs = mod.questions.slice(0, Math.min(mod.questions.length, qCount));
    const correct = nr.filter((v,i) => isCorrect(activeQs[i], v)).length;
    const pct = Math.round(correct / activeQs.length * 100);
    const duration = Math.round((Date.now() - (quizStartedAt || Date.now())) / 1000);
    const passMark = settings?.passMark ?? 60;
    const passed = pct >= passMark;
    const att = { id:`${mod.id}-${Date.now()}`, moduleId:mod.id, ts:Date.now(), correct, total:activeQs.length, pct, responses:nr, duration };
    await api.saveAttempt(att).catch(()=>{});
    await api.clearProgress(modId).catch(()=>{});
    setAttempts(prev => [...prev, att]);

    if (passed && settings?.certEnabled !== false) {
      const existingCert = certs.find(c=>c.moduleId===mod.id);
      if (!existingCert || pct > (existingCert.pct||0)) {
        const cert = { id:`cert-${mod.id}-${Date.now()}`, moduleId:mod.id, moduleTitle:mod.title, pct, issuedAt:new Date().toISOString(), userName:user?.displayName||user?.username, orgName:settings?.orgName||'Comp X' };
        await api.saveCertificate(cert).catch(()=>{});
        setCerts(prev => [...prev.filter(c=>c.moduleId!==mod.id), cert]);
      }
    }
    setLastResult({...att, duration, passed, passMark});
    setView('results');
  }

  async function updateSettings(s) { setSettingsState(s); await api.saveSettings(s).catch(()=>{}); showSnack('Settings saved'); }

  const mod = useMemo(() => modules.find(m=>m.id===modId), [modId, modules]);
  const passMark = settings?.passMark ?? 60;

  if (view==='loading') return (
    <ThemeProvider theme={activeTheme}><CssBaseline/>
      <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:2}}>
        <CircularProgress color="primary"/><Typography color="text.secondary">Loading…</Typography>
      </Box>
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={activeTheme}><CssBaseline/>
    <ThemeColoursCtx.Provider value={{ themeColours, applyThemeColours }}>
    <ModulesCtx.Provider value={{ modules, setModules }}>
      <Box sx={{display:'flex',flexDirection:'column',minHeight:'100vh',bgcolor:'background.default'}}>
        {view!=='auth' && <NavBar user={user} onLogout={onLogout} goHome={goHome}
          goAnalytics={()=>setView('analytics')} goAdmin={()=>setView('admin')}
          goSettings={()=>setView('settings')} goQBank={()=>setView('qbank')}
          goCerts={()=>setView('certs')} goReport={()=>setView('report')}
          goTheme={()=>setView('theme')}
          notifications={notifications}
          onOpenNotifications={()=>setNotifDrawerOpen(true)}
          appTitle={settings?.appTitle||'CyberCBT'}/>}
        <Box sx={{flex:1, py: view==='auth'?0:4}}>
          {view==='auth'      && <AuthView onLogin={onLogin} showSnack={showSnack}/>}
          {view==='pending'    && <PendingView onBack={()=>{api.logout();setView('auth');}}/>}
          {view==='dashboard' && <Container maxWidth="lg"><Dashboard attempts={attempts} certs={certs} user={user} startMod={startMod} goAnalytics={()=>setView('analytics')} settings={settings} modules={modules}/></Container>}
          {view==='learn'     && mod && <Container maxWidth="md"><LearnView module={mod} onStartQuiz={()=>startMod(mod.id,'quiz')} onBack={goHome}/></Container>}
          {view==='quiz'      && mod && <Container maxWidth="md"><QuizView module={mod} qIndex={qIndex} onAnswer={answer} onBack={goHome} startedAt={quizStartedAt} questionCount={Math.min(settings?.questionCount||30, mod.questions.length)}/></Container>}
          {view==='results'   && lastResult && mod && <Container maxWidth="md"><ResultsView attempt={lastResult} module={mod} attempts={attempts} passMark={passMark} onRetry={()=>startMod(mod.id,'quiz')} onLearn={()=>setView('learn')} onHome={goHome} cert={certs.find(c=>c.moduleId===mod.id)} onViewCerts={()=>setView('certs')}/></Container>}
          {view==='analytics' && <Container maxWidth="lg"><AnalyticsView attempts={attempts} modules={modules} passMark={passMark}/></Container>}
          {view==='admin'     && <Container maxWidth="xl"><AdminView user={user} showSnack={showSnack} onBack={goHome} modules={modules} settings={settings} onSaveSettings={updateSettings}/></Container>}
          {view==='settings'  && <Container maxWidth="sm"><SettingsView user={user} showSnack={showSnack} onLogout={onLogout} onBack={goHome} settings={settings} onSave={updateSettings} themeColours={themeColours} onApplyTheme={applyThemeColours}/></Container>}
          {view==='theme'     && <Container maxWidth="md"><ThemeEditorView onBack={goHome} showSnack={showSnack}/></Container>}
          {view==='qbank'     && <Container maxWidth="xl"><QBankView showSnack={showSnack} onBack={goHome}/></Container>}
          {view==='certs'     && <Container maxWidth="md"><CertsView certs={certs} attempts={attempts} modules={modules} passMark={passMark} user={user} settings={settings} onBack={goHome}/></Container>}
          {view==='report'    && <Container maxWidth="xl"><ReportView user={user} showSnack={showSnack} onBack={goHome} modules={modules} passMark={passMark}/></Container>}
        </Box>
        <Box component="footer" sx={{py:2,px:3,bgcolor:'background.paper',borderTop:'1px solid',borderColor:'divider'}}>
          <Typography variant="caption" color="text.secondary">
            CyberCBT · Content from NCSC <em>Top Tips for Staff</em> · ncsc.gov.uk · Crown Copyright, OGL v3.0
          </Typography>
        </Box>
        <Snackbar open={snack.open} autoHideDuration={4000} onClose={()=>setSnack(s=>({...s,open:false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
          <Alert severity={snack.sev} onClose={()=>setSnack(s=>({...s,open:false}))}>{snack.msg}</Alert>
        </Snackbar>
        <NotificationDrawer
          open={notifDrawerOpen}
          onClose={()=>setNotifDrawerOpen(false)}
          notifications={notifications}
          onAction={(n)=>{
            setNotifDrawerOpen(false);
            if (n.action==='admin')   { setView('admin'); }
            if (n.action==='dashboard'){ setView('dashboard'); }
            if (n.action==='learn' && n.actionModuleId) { startMod(n.actionModuleId,'learn'); }
          }}
        />
        <Dialog open={!!resumeDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{display:'flex',alignItems:'center',gap:1}}>
            <PlayArrowIcon color="primary"/> Resume quiz?
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>You have an unfinished quiz saved from {resumeDialog ? new Date(resumeDialog.savedAt).toLocaleString() : ''}.</Typography>
            <Typography variant="body2" color="text.secondary">You were on question <strong>{(resumeDialog?.qIndex||0)+1}</strong> of {mod?.questions?.length||0}. Resume from where you left off, or start fresh.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>{ setResumeDialog(null); beginQuiz(modId,0,[],Date.now()); }}>Start fresh</Button>
            <Button variant="contained" onClick={()=>{ if(resumeDialog) beginQuiz(modId,resumeDialog.qIndex,resumeDialog.responses||[],resumeDialog.startedAt||Date.now()); }}>
              Resume (Q{(resumeDialog?.qIndex||0)+1})
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ModulesCtx.Provider>
    </ThemeColoursCtx.Provider>
    </ThemeProvider>
  );
}

// ─── AUTH VIEW ────────────────────────────────────────────────────────────────
function DBModeToggle() {
  const [mode, setMode]     = useState(api.getMode());
  const [baseUrl, setUrl]   = useState(api.getBaseUrl());
  const [open, setOpen]     = useState(false);
  function save() { api.setMode(mode); api.setBaseUrl(baseUrl); setOpen(false); }
  return (
    <Box sx={{mt:3,textAlign:'center'}}>
      <Button size="small" startIcon={<StorageIcon sx={{fontSize:14}}/>} onClick={()=>setOpen(!open)} sx={{color:'text.secondary',fontSize:12}}>
        Storage: {api.getMode()==='local'?'Local (browser)':`SQL — ${api.getBaseUrl()||'(no URL)'}`}
      </Button>
      <Collapse in={open}>
        <Paper variant="outlined" sx={{p:2,mt:1,textAlign:'left'}}>
          <Typography variant="caption" fontWeight={700} display="block" sx={{mb:1}}>Database mode</Typography>
          <Box sx={{display:'flex',gap:1,mb:1.5}}>
            {['local','remote'].map(m=>(
              <Button key={m} size="small" variant={mode===m?'contained':'outlined'} color={m==='remote'?'secondary':'primary'} onClick={()=>setMode(m)}>
                {m==='local'?'Local (browser)':'Remote SQL'}
              </Button>
            ))}
          </Box>
          {mode==='remote'&&<TextField fullWidth size="small" label="Server URL" placeholder="http://localhost:3001" value={baseUrl} onChange={e=>setUrl(e.target.value)} sx={{mb:1.5}} helperText="URL of your CyberCBT SQL server (server.js)"/>}
          <Button size="small" variant="contained" onClick={save} startIcon={<SaveIcon/>}>Save & close</Button>
          {mode==='remote'&&<Alert severity="info" sx={{mt:1.5}} icon={false}><Typography variant="caption">Run <code>node server.js</code> from the project folder to start the SQL backend. SQLite by default — no separate DB server needed.</Typography></Alert>}
        </Paper>
      </Collapse>
    </Box>
  );
}

// ─── IMAGE CAPTCHA ───────────────────────────────────────────────────────────
// Canvas-drawn distorted text with noise lines and dots.
// Max 3 attempts before lockout (30s cooldown). No external service.

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
const MAX_ATTEMPTS  = 3;
const LOCKOUT_SECS  = 30;

function generateCaptchaText(len = 5) {
  let s = '';
  for (let i = 0; i < len; i++) s += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  return s;
}

function drawCaptcha(canvas, text) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);

  // Noise dots
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `rgba(${80+Math.random()*80},${80+Math.random()*80},${80+Math.random()*80},${0.4+Math.random()*0.4})`;
    ctx.beginPath();
    ctx.arc(Math.random()*W, Math.random()*H, Math.random()*2.5, 0, Math.PI*2);
    ctx.fill();
  }

  // Noise lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${100+Math.random()*100},${100+Math.random()*100},${100+Math.random()*100},0.35)`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(Math.random()*W, Math.random()*H);
    ctx.bezierCurveTo(Math.random()*W, Math.random()*H, Math.random()*W, Math.random()*H, Math.random()*W, Math.random()*H);
    ctx.stroke();
  }

  // Draw each character with distortion
  const charW = W / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    const x = charW * (i + 0.8) + (Math.random() - 0.5) * 6;
    const y = H * 0.65 + (Math.random() - 0.5) * 10;
    const angle = (Math.random() - 0.5) * 0.45;
    const size = 24 + Math.random() * 8;
    const hue = 10 + Math.random() * 40; // red-orange range matching brand
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${size}px monospace`;
    ctx.fillStyle = `hsl(${hue},90%,${65+Math.random()*20}%)`;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

function useImageCaptcha() {
  const [text, setText]       = useState('');
  const [answer, setAnswer]   = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(0);   // timestamp when lockout ends
  const [solved, setSolved]   = useState(false);
  const canvasRef             = useRef(null);

  function refresh() {
    const t = generateCaptchaText();
    setText(t); setAnswer(''); setSolved(false);
    setTimeout(() => drawCaptcha(canvasRef.current, t), 0);
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (text && canvasRef.current) drawCaptcha(canvasRef.current, text); }, [text]);

  // Lockout countdown
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!lockout) return;
    const t = setInterval(() => {
      const left = Math.ceil((lockout - Date.now()) / 1000);
      if (left <= 0) { setLockout(0); setAttempts(0); refresh(); clearInterval(t); }
      else setRemaining(left);
    }, 500);
    return () => clearInterval(t);
  }, [lockout]);

  function verify(input) {
    if (lockout && Date.now() < lockout) return false;
    if (input.toUpperCase().trim() === text) { setSolved(true); setAttempts(0); return true; }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= MAX_ATTEMPTS) {
      setLockout(Date.now() + LOCKOUT_SECS * 1000);
      setRemaining(LOCKOUT_SECS);
    } else {
      refresh();
    }
    return false;
  }

  const isLocked   = lockout > 0 && Date.now() < lockout;
  const attemptsLeft = MAX_ATTEMPTS - attempts;

  return { canvasRef, answer, setAnswer, verify, refresh, solved, isLocked, remaining, attemptsLeft, attempts };
}

function AuthView({ onLogin, showSnack }) {
  const [appTitle, setAppTitle] = useState('CyberCBT');
  useEffect(()=>{ api.loadSettings().then(s=>{ if(s?.appTitle) setAppTitle(s.appTitle); }).catch(()=>{}); },[]);
  const [tab, setTab]           = useState(0);
  const [username, setUsername] = useState('');
  const [displayName, setDN]   = useState('');
  const [pass, setPass]         = useState('');
  const [err, setErr]           = useState('');
  const [busy, setBusy]         = useState(false);
  const [honey, setHoney]       = useState('');
  const captcha = useImageCaptcha();

  useEffect(() => { captcha.refresh(); setErr(''); }, [tab]);

  async function submit(e) {
    e.preventDefault();
    if (honey) return;
    if (captcha.isLocked) { setErr(`Too many failed attempts. Please wait ${captcha.remaining}s.`); return; }
    if (!captcha.solved) {
      const ok = captcha.verify(captcha.answer);
      if (!ok) {
        if (captcha.isLocked) setErr(`Too many failed attempts. Please wait ${LOCKOUT_SECS} seconds.`);
        else setErr(`Incorrect — ${captcha.attemptsLeft} attempt${captcha.attemptsLeft !== 1 ? 's' : ''} remaining.`);
        return;
      }
    }
    setErr(''); setBusy(true);
    try {
      const r = tab === 0
        ? await api.login(username.trim(), pass)
        : await api.register(username.trim(), pass, displayName.trim());
      onLogin(r.user);
    } catch(e) { setErr(e.message); captcha.refresh(); }
    setBusy(false);
  }

  return (
    <Box sx={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg, #141413 0%, #1D1D1B 50%, #251010 100%)',p:2}}>
      <Paper elevation={0} sx={{width:'100%',maxWidth:440,borderRadius:3,overflow:'hidden',border:`1px solid ${BRAND.border}`}}>
        <Box sx={{bgcolor:BRAND.black,px:4,py:3,color:'white',textAlign:'center',borderBottom:`3px solid ${BRAND.red}`}}>
          <SecurityIcon sx={{fontSize:48,mb:1,color:BRAND.red}}/>
          <Typography variant="h5" fontWeight={700} color="white">{appTitle}</Typography>
          <Typography variant="caption" sx={{opacity:.7,color:BRAND.textSec}}>NCSC-Aligned Staff Training</Typography>
        </Box>
        <Box sx={{px:4,py:3}}>
          <Box sx={{display:'flex',mb:3,borderRadius:1,overflow:'hidden',border:'1px solid',borderColor:'divider'}}>
            {['Sign in','Register'].map((l,i)=>(
              <Button key={l} fullWidth onClick={()=>setTab(i)} variant={tab===i?'contained':'text'} sx={{borderRadius:0}}>{l}</Button>
            ))}
          </Box>
          {err && <Alert severity="error" sx={{mb:2}}>{err}</Alert>}
          <form onSubmit={submit} autoComplete="off">
            <input type="text" name="website" value={honey} onChange={e=>setHoney(e.target.value)}
              tabIndex={-1} aria-hidden="true"
              style={{position:'absolute',left:'-9999px',width:1,height:1,opacity:0,pointerEvents:'none'}}/>
            {tab===1 && <TextField fullWidth label="Full name" value={displayName} onChange={e=>setDN(e.target.value)} sx={{mb:2}} placeholder="e.g. Jane Smith" helperText="Shown on certificates and reports"/>}
            <TextField fullWidth label="Username" value={username} onChange={e=>setUsername(e.target.value)} sx={{mb:2}} required/>
            <TextField fullWidth label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} sx={{mb:2.5}} required helperText={tab===1?'Minimum 8 characters':''}/>

            {/* Image CAPTCHA */}
            <Paper variant="outlined" sx={{p:2, mb:2.5,
              borderColor: captcha.solved ? 'success.main' : captcha.isLocked ? 'error.main' : 'divider',
              transition:'border-color .2s'}}>
              <Box sx={{display:'flex',alignItems:'center',gap:1,mb:1.5}}>
                <SecurityIcon sx={{fontSize:15,color:'text.secondary'}}/>
                <Typography variant="caption" color="text.secondary" fontWeight={700}
                  sx={{textTransform:'uppercase',letterSpacing:.8,flex:1}}>
                  Security verification
                </Typography>
                {captcha.solved && <CheckCircle sx={{fontSize:16,color:'success.main'}}/>}
                {captcha.isLocked && <Cancel sx={{fontSize:16,color:'error.main'}}/>}
              </Box>

              {captcha.isLocked ? (
                <Box sx={{textAlign:'center',py:1.5}}>
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    Too many failed attempts
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">{captcha.remaining}s</Typography>
                  <Typography variant="caption" color="text.secondary">Please wait before trying again</Typography>
                </Box>
              ) : captcha.solved ? (
                <Box sx={{textAlign:'center',py:1.5,display:'flex',alignItems:'center',justifyContent:'center',gap:1}}>
                  <CheckCircle sx={{color:'success.main',fontSize:24}}/>
                  <Typography variant="body2" color="success.main" fontWeight={600}>Verified</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{display:'flex',alignItems:'center',gap:1,mb:1.5}}>
                    {/* Canvas image */}
                    <Box sx={{borderRadius:1,overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0,userSelect:'none'}}>
                      <canvas ref={captcha.canvasRef} width={180} height={60}
                        style={{display:'block',userSelect:'none',WebkitUserSelect:'none'}}/>
                    </Box>
                    <Tooltip title="New image">
                      <IconButton size="small" onClick={captcha.refresh} sx={{color:'text.secondary'}}>
                        <RefreshIcon/>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth size="small"
                    label="Type the characters above"
                    value={captcha.answer}
                    onChange={e => captcha.setAnswer(e.target.value.toUpperCase())}
                    inputProps={{maxLength:6, style:{letterSpacing:4,fontWeight:700,fontFamily:'monospace',textTransform:'uppercase'}}}
                    helperText={captcha.attempts > 0 ? `${captcha.attemptsLeft} attempt${captcha.attemptsLeft!==1?'s':''} remaining` : '5 characters · not case sensitive'}
                    FormHelperTextProps={{sx:{color:captcha.attempts>0?'warning.main':'text.secondary'}}}
                  />
                </>
              )}
            </Paper>

            <Button fullWidth variant="contained" type="submit" size="large"
              disabled={busy || captcha.isLocked}
              startIcon={busy && <CircularProgress size={16} color="inherit"/>}>
              {tab===0?'Sign in':'Create account'}
            </Button>
          </form>
          <DBModeToggle/>
        </Box>
      </Paper>
    </Box>
  );
}


// ─── NAV BAR ─────────────────────────────────────────────────────────────────
function NavBar({ user, onLogout, goHome, goAnalytics, goAdmin, goSettings, goQBank, goCerts, goReport, notifications=[], onOpenNotifications, appTitle='CyberCBT', goTheme }) {
  const [anchor, setAnchor] = useState(null);
  const unreadCount = notifications.length;
  const hasError = notifications.some(n => n.severity === 'error');
  const hasWarning = !hasError && notifications.some(n => n.severity === 'warning');
  const bellColor = hasError ? 'error' : hasWarning ? 'warning' : 'default';
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <SecurityIcon sx={{mr:1.5,color:BRAND.red}}/>
        <Typography variant="h6" fontWeight={700} sx={{flexGrow:1,cursor:'pointer'}} onClick={goHome}>{appTitle}</Typography>
        <Typography variant="caption" sx={{mr:2,opacity:.6,display:{xs:'none',md:'block'}}}>NCSC-Aligned Staff Training</Typography>

        {/* Notification bell */}
        <Tooltip title={unreadCount > 0 ? `${unreadCount} notification${unreadCount!==1?'s':''}` : 'No notifications'}>
          <IconButton color="inherit" onClick={onOpenNotifications} sx={{mr:.5}}>
            <Badge badgeContent={unreadCount||null} color={bellColor==='error'?'error':bellColor==='warning'?'warning':'primary'} max={9}>
              <NotificationsIcon sx={{color: hasError ? '#FF5252' : hasWarning ? '#F0A500' : 'inherit'}}/>
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Customise theme"><IconButton color="inherit" onClick={goTheme}><PaletteIcon/></IconButton></Tooltip>
        <Tooltip title="Analytics"><IconButton color="inherit" onClick={goAnalytics}><BarChartIcon/></IconButton></Tooltip>
        <Tooltip title="My Certificates"><IconButton color="inherit" onClick={goCerts}><CertIcon/></IconButton></Tooltip>
        {user?.role==='admin' && <Tooltip title="Completion Report"><IconButton color="inherit" onClick={goReport}><ReportIcon2/></IconButton></Tooltip>}
        <Tooltip title="Account">
          <IconButton color="inherit" onClick={e=>setAnchor(e.currentTarget)}>
            <Avatar sx={{width:30,height:30,bgcolor:BRAND.red,fontSize:14}}>{user?.username?.[0]?.toUpperCase()||'?'}</Avatar>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)} transformOrigin={{horizontal:'right',vertical:'top'}} anchorOrigin={{horizontal:'right',vertical:'bottom'}}>
          <MenuItem disabled><Typography variant="caption" color="text.secondary">Signed in as <strong>{user?.displayName||user?.username}</strong>{user?.role==='admin'&&<Chip label="admin" size="small" color="primary" sx={{ml:.5,height:16,fontSize:10}}/>}</Typography></MenuItem>
          <Divider/>
          {user?.role==='admin'&&<MenuItem onClick={()=>{setAnchor(null);goAdmin();}}><AdminIcon sx={{mr:1.5,fontSize:18}}/>Admin panel</MenuItem>}
          {user?.role==='admin'&&<MenuItem onClick={()=>{setAnchor(null);goReport();}}><ReportIcon2 sx={{mr:1.5,fontSize:18}}/>Completion report</MenuItem>}
          <MenuItem onClick={()=>{setAnchor(null);goQBank();}}><EditIcon sx={{mr:1.5,fontSize:18}}/>Question bank</MenuItem>
          <MenuItem onClick={()=>{setAnchor(null);goCerts();}}><CertIcon sx={{mr:1.5,fontSize:18}}/>My certificates</MenuItem>
          <MenuItem onClick={()=>{setAnchor(null);goSettings();}}><PersonIcon sx={{mr:1.5,fontSize:18}}/>Settings & wipe</MenuItem>
          <Divider/>
          <MenuItem onClick={()=>{setAnchor(null);onLogout();}} sx={{color:'error.main'}}><LogoutIcon sx={{mr:1.5,fontSize:18}}/>Sign out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ attempts, certs, user, startMod, goAnalytics, settings, modules: modulesProp }) {
  const { modules: modulesCtx } = useModules();
  const modules = modulesProp || modulesCtx;
  const passMark = settings?.passMark ?? 60;
  const suggestions = useMemo(()=>suggestNext(attempts, modules),[attempts, modules]);
  const top = suggestions[0];
  const totalAttempts = attempts.length;
  const overallAvg = totalAttempts ? Math.round(attempts.reduce((s,a)=>s+a.pct,0)/totalAttempts) : null;
  const completedModules = modules.filter(m=>attempts.some(a=>a.moduleId===m.id)).length;
  const recent = [...attempts].sort((a,b)=>b.ts-a.ts).slice(0,5);
  const TopIcon = top.module.icon;

  return (
    <Box>
      <Box sx={{mb:4}}>
        <Typography variant="h4" gutterBottom>Welcome back{user?.username?`, ${user.username}`:''}</Typography>
        <Typography color="text.secondary">{top.module.questions?.length||30} questions per module · {modules.map(m=>m.title.split(' ').slice(-1)[0]).join(' · ')}</Typography>
      </Box>
      <Grid container spacing={3} sx={{mb:4}}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{p:3,background:`linear-gradient(135deg, ${BRAND.black} 0%, #2A0A0F 100%)`,color:'white',borderRadius:2,height:'100%',boxSizing:'border-box',border:`1px solid ${BRAND.red}40`}}>
            <Box sx={{display:'flex',alignItems:'center',gap:1,mb:1,opacity:.8}}><SparkleIcon fontSize="small"/><Typography variant="overline">Suggested next</Typography></Box>
            <Box sx={{display:'flex',alignItems:'center',gap:2,mb:1}}><TopIcon sx={{fontSize:36}}/><Typography variant="h5" fontWeight={700}>{top.module.title}</Typography></Box>
            <Typography sx={{mb:2.5,opacity:.9}}>{top.reason}</Typography>
            <Box sx={{display:'flex',gap:1.5,flexWrap:'wrap'}}>
              <Button variant="contained" sx={{bgcolor:BRAND.red,color:'white','&:hover':{bgcolor:BRAND.redDark}}} startIcon={<BookIcon/>} onClick={()=>startMod(top.module.id,'learn')}>Read first</Button>
              <Button variant="outlined" sx={{borderColor:'rgba(255,255,255,.4)',color:'white','&:hover':{borderColor:'white',bgcolor:'rgba(255,255,255,.08)'}}} endIcon={<ArrowForward/>} onClick={()=>startMod(top.module.id,'quiz')}>Jump to quiz</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {[{label:'Modules attempted',value:`${completedModules}/${modules.length}`,icon:<FlagIcon/>},{label:'Average score',value:overallAvg!=null?`${overallAvg}%`:'—',icon:<TrophyIcon/>},{label:'Total attempts',value:totalAttempts,icon:<FlameIcon/>}].map(s=>(
              <Grid item xs={12} key={s.label}>
                <Paper elevation={1} sx={{p:2,display:'flex',alignItems:'center',gap:2}}>
                  <Box sx={{color:'primary.main'}}>{s.icon}</Box>
                  <Box><Typography variant="caption" color="text.secondary" sx={{display:'block',textTransform:'uppercase',letterSpacing:.8}}>{s.label}</Typography><Typography variant="h5" fontWeight={700}>{s.value}</Typography></Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:2}}>
        <Typography variant="h5">All modules</Typography>
        <Button endIcon={<BarChartIcon/>} onClick={goAnalytics} size="small">View analytics</Button>
      </Box>
      <Grid container spacing={2} sx={{mb:4}}>
        {modules.map(m=>{
          const stats=moduleStats(attempts,m.id); const col=getCol(m.id); const Icon=m.icon;
          return (
            <Grid item xs={12} sm={6} key={m.id}>
              <Card sx={{height:'100%'}}>
                <CardActionArea sx={{height:'100%',alignItems:'flex-start',p:0}} onClick={()=>startMod(m.id,'learn')}>
                  <CardContent sx={{height:'100%',display:'flex',flexDirection:'column'}}>
                    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',mb:1.5}}>
                      <Box sx={{width:48,height:48,borderRadius:2,bgcolor:col.light,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon sx={{color:col.main,fontSize:26}}/></Box>
                      {stats.latest!=null?<ScoreChip pct={stats.latest}/>:<Chip label="Not started" size="small" variant="outlined"/>}
                    </Box>
                    <Typography variant="h6" gutterBottom>{m.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{flex:1,mb:2}}>{m.summary}</Typography>
                    <Divider sx={{mb:1.5}}/>
                    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <Typography variant="caption" color="text.secondary">{stats.count} attempt{stats.count!==1?'s':''} · best {stats.best!=null?`${stats.best}%`:'—'} · {m.questions?.length||0} Qs</Typography>
                      <TrendChip trend={stats.trend}/>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {recent.length>0&&(
        <Box>
          <Typography variant="h5" sx={{mb:2}}>Recent activity</Typography>
          <Paper elevation={1}>
            <List disablePadding>
              {recent.map((a,i)=>{
                const m=modules.find(x=>x.id===a.moduleId)||{title:'Unknown',icon:SecurityIcon}; const col=getCol(m.id); const Icon=m.icon;
                return (<React.Fragment key={a.id}>
                  {i>0&&<Divider/>}
                  <ListItem secondaryAction={<ScoreChip pct={a.pct}/>}>
                    <ListItemIcon><Box sx={{width:36,height:36,borderRadius:1.5,bgcolor:col.light,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon sx={{color:col.main,fontSize:20}}/></Box></ListItemIcon>
                    <ListItemText primary={m.title} secondary={`${a.correct}/${a.total} correct · ${new Date(a.ts).toLocaleString()}`}/>
                  </ListItem>
                </React.Fragment>);
              })}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

// ─── LEARN VIEW ───────────────────────────────────────────────────────────────
function LearnView({ module, onStartQuiz, onBack }) {
  const col=getCol(module.id); const Icon=module.icon;
  return (
    <Box>
      <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:3}}>Dashboard</Button>
      <Box sx={{display:'flex',alignItems:'center',gap:2,mb:2}}>
        <Box sx={{width:52,height:52,borderRadius:2,bgcolor:col.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon sx={{color:col.main,fontSize:28}}/></Box>
        <Box><Typography variant="overline" color="text.secondary">Module</Typography><Typography variant="h4">{module.title}</Typography></Box>
      </Box>
      <Typography color="text.secondary" sx={{mb:3}}>{module.summary}</Typography>
      <Typography variant="h6" sx={{mb:1.5}}>Key learning points</Typography>
      <List disablePadding sx={{mb:3}}>
        {(module.lessons||[]).map((l,i)=>(
          <Paper key={i} elevation={0} variant="outlined" sx={{mb:1.5,borderRadius:2}}>
            <ListItem alignItems="flex-start">
              <ListItemIcon sx={{minWidth:36}}><Box sx={{width:26,height:26,borderRadius:'50%',bgcolor:col.main,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700}}>{i+1}</Box></ListItemIcon>
              <ListItemText primary={l}/>
            </ListItem>
          </Paper>
        ))}
      </List>
      <Alert severity="info" sx={{mb:3}}>
        <strong>{module.questions?.length||0} questions follow</strong> — some accept multiple correct answers. When you see the "Select all that apply" label, tick every correct option before submitting.
      </Alert>
      <Button variant="contained" size="large" endIcon={<ArrowForward/>} onClick={onStartQuiz}>Take the quiz</Button>
    </Box>
  );
}

// ─── QUIZ VIEW ────────────────────────────────────────────────────────────────
function QuizView({ module, qIndex, onAnswer, onBack, startedAt, questionCount=30 }) {
  const questions = module.questions.slice(0, Math.min(module.questions.length, questionCount));
  const q=questions[qIndex]; const isMulti=q?.type==='multi';
  if (!q) return null;
  const [singleSel,setSingleSel]=useState(null); const [multiSel,setMultiSel]=useState([]); const [revealed,setRevealed]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const col=getCol(module.id); const total=questions.length;
  const progress=Math.round(((qIndex+(revealed?1:0))/total)*100);
  useEffect(()=>{setSingleSel(null);setMultiSel([]);setRevealed(false);},[qIndex]);
  useEffect(()=>{
    const t=setInterval(()=>setElapsed(Math.floor((Date.now()-(startedAt||Date.now()))/1000)),1000);
    return()=>clearInterval(t);
  },[startedAt]);
  function fmtTime(s){const m=Math.floor(s/60);return `${m}:${String(s%60).padStart(2,'0')}`;}
  const correctSet=new Set(isMulti?q.answer:[q.answer]);
  const isCorrectOverall=isCorrect(q,isMulti?multiSel:singleSel);
  return (
    <Box>
      <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:3}}>Exit quiz</Button>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1}}>
        <Typography variant="body2" color="text.secondary">{module.title}</Typography>
        <Box sx={{display:'flex',alignItems:'center',gap:2}}>
          <Box sx={{display:'flex',alignItems:'center',gap:.5}}><TimerIcon sx={{fontSize:14,color:'text.secondary'}}/><Typography variant="body2" color="text.secondary">{fmtTime(elapsed)}</Typography></Box>
          <Typography variant="body2" color="text.secondary">Q {qIndex+1} / {total}</Typography>
        </Box>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{mb:3,height:6,borderRadius:3,bgcolor:'grey.200','& .MuiLinearProgress-bar':{bgcolor:col.main}}}/>
      {isMulti&&<Chip icon={<CheckBoxIcon/>} label="Select all that apply" size="small" sx={{mb:2,bgcolor:COL.reporting.light,color:COL.reporting.dark}}/>}
      <Typography variant="h6" sx={{mb:3,fontWeight:600}}>{q.q}</Typography>
      <Box sx={{display:'flex',flexDirection:'column',gap:1.5,mb:3}}>
        {q.options.map((opt,i)=>{
          const selected=isMulti?multiSel.includes(i):singleSel===i; const isCorrectOpt=correctSet.has(i);
          let borderColor='divider',bgcolor='background.paper',endIcon=null;
          if(revealed){if(isCorrectOpt){borderColor='success.main';bgcolor='#E8F5E9';endIcon=<CheckCircle sx={{color:'success.main'}}/>;}else if(selected){borderColor='error.main';bgcolor='#FFEBEE';endIcon=<Cancel sx={{color:'error.main'}}/>;}}
          else if(selected){borderColor=col.main;bgcolor=col.light;}
          return (
            <Paper key={i} variant="outlined" onClick={()=>{if(!revealed){isMulti?setMultiSel(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]):setSingleSel(i);}}}
              sx={{p:2,cursor:revealed?'default':'pointer',border:'2px solid',borderColor,bgcolor,display:'flex',alignItems:'center',gap:2,transition:'border-color .15s, background-color .15s','&:hover':revealed?{}:{borderColor:col.main,bgcolor:col.light}}}>
              {isMulti?(selected?<CheckBoxIcon sx={{color:col.main,flexShrink:0}}/>:<CheckBoxOutlineBlank sx={{color:'text.disabled',flexShrink:0}}/>)
                :<Box sx={{width:24,height:24,borderRadius:'50%',border:'2px solid',borderColor:selected?col.main:'grey.400',bgcolor:selected?col.main:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{selected&&<Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:'white'}}/>}</Box>}
              <Typography variant="body1" sx={{flex:1}}>{opt}</Typography>
              {endIcon&&<Box sx={{flexShrink:0}}>{endIcon}</Box>}
            </Paper>
          );
        })}
      </Box>
      {revealed&&<Alert severity={isCorrectOverall?'success':'error'} sx={{mb:3}}><AlertTitle>{isCorrectOverall?'Correct':'Not quite'}</AlertTitle>{q.explainer}</Alert>}
      <Box sx={{display:'flex',justifyContent:'flex-end'}}>
        {!revealed?<Button variant="contained" onClick={()=>{if(isMulti?multiSel.length>0:singleSel!==null)setRevealed(true);}} disabled={isMulti?multiSel.length===0:singleSel===null}>Submit answer</Button>
          :<Button variant="contained" endIcon={<ArrowForward/>} onClick={()=>onAnswer(isMulti?multiSel:singleSel)} sx={{bgcolor:col.main,'&:hover':{bgcolor:col.dark}}}>{qIndex+1<total?'Next question':'See results'}</Button>}
      </Box>
    </Box>
  );
}

// ─── RESULTS VIEW ─────────────────────────────────────────────────────────────
function ResultsView({ attempt, module, attempts, passMark=60, onRetry, onLearn, onHome, cert, onViewCerts }) {
  const { modules } = useModules();
  const passed=attempt.pct>=(passMark); const col=getCol(module.id);
  const previous=[...attempts].filter(a=>a.moduleId===module.id&&a.id!==attempt.id).sort((a,b)=>b.ts-a.ts)[0];
  const delta=previous?attempt.pct-previous.pct:null;
  const misses=attempt.responses.map((r,i)=>({r,q:module.questions[i],i})).filter(x=>!isCorrect(x.q,x.r));
  const suggestions=useMemo(()=>suggestNext(attempts,modules),[attempts,modules]);
  function fmtDuration(s){if(!s)return'—';const m=Math.floor(s/60);return m>0?`${m}m ${s%60}s`:`${s}s`;}
  const next=suggestions[0];
  function fmtAnswer(q,r){if(q.type==='multi')return Array.isArray(r)&&r.length?r.map(i=>q.options[i]).join('; '):'(none)';return q.options[r];}
  return (
    <Box>
      <Paper elevation={3} sx={{p:4,mb:3,textAlign:'center',borderTop:'4px solid',borderColor:passed?'success.main':'error.main'}}>
        <Typography variant="overline" color="text.secondary">Attempt complete · {module.title}</Typography>
        <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:3,my:2}}>
          <Box sx={{position:'relative',display:'inline-flex'}}>
            <CircularProgress variant="determinate" value={attempt.pct} size={100} thickness={5} sx={{color:passed?'success.main':'error.main'}}/>
            <Box sx={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><Typography variant="h5" fontWeight={700}>{attempt.pct}%</Typography></Box>
          </Box>
          <Box sx={{textAlign:'left'}}>
            <Typography variant="h5" fontWeight={700}>{attempt.correct} / {attempt.total} correct</Typography>
            <Chip label={passed?'PASS':'Below pass mark (60%)'} color={passed?'success':'error'} sx={{mt:.5}}/>
            {delta!==null&&<Typography variant="body2" color="text.secondary" sx={{mt:.5}}>{delta>0?`▲ +${delta}%`:delta<0?`▼ ${delta}%`:'= same'} vs previous</Typography>}
          </Box>
        </Box>
      </Paper>
      {misses.length>0?(
        <Box sx={{mb:3}}>
          <Typography variant="h6" sx={{display:'flex',alignItems:'center',gap:1,mb:1.5}}><WarningIcon color="warning"/> Worth re-reading ({misses.length})</Typography>
          {misses.map(m=>(
            <Paper key={m.i} variant="outlined" sx={{p:2,mb:1.5}}>
              <Typography variant="body2" fontWeight={600} sx={{mb:.5}}>Q{m.i+1}{m.q.type==='multi'?' (multi-select)':''}: {m.q.q}</Typography>
              <Typography variant="body2" color="error.main" sx={{mb:.25}}>Your answer: {fmtAnswer(m.q,m.r)}</Typography>
              <Typography variant="body2" color="success.main" sx={{mb:.75}}>Correct: {m.q.type==='multi'?m.q.answer.map(i=>m.q.options[i]).join('; '):m.q.options[m.q.answer]}</Typography>
              <Typography variant="caption" color="text.secondary">{m.q.explainer}</Typography>
            </Paper>
          ))}
        </Box>
      ):(
        <Alert severity="success" icon={<TrophyIcon/>} sx={{mb:3}}><AlertTitle>Perfect score!</AlertTitle>Every answer correct. Come back in a few weeks for a refresher.</Alert>
      )}
      {/* Time taken */}
      {attempt.duration>0&&<Box sx={{display:'flex',alignItems:'center',gap:.5,mb:2}}><TimerIcon sx={{fontSize:16,color:'text.secondary'}}/><Typography variant="body2" color="text.secondary">Completed in {fmtDuration(attempt.duration)}</Typography></Box>}
      {/* Certificate banner */}
      {passed&&cert&&(
        <Paper elevation={0} sx={{p:2.5,mb:3,border:`2px solid`,borderColor:'warning.main',borderRadius:2,background:'rgba(240,165,0,0.06)',display:'flex',alignItems:'center',gap:2}}>
          <CertIcon sx={{fontSize:36,color:'warning.main',flexShrink:0}}/>
          <Box sx={{flex:1}}>
            <Typography variant="subtitle1" fontWeight={700} color="warning.main">Certificate earned!</Typography>
            <Typography variant="body2" color="text.secondary">You passed with {cert.pct}% on {new Date(cert.issuedAt).toLocaleDateString('en-GB')}. View and download your certificate.</Typography>
          </Box>
          <Button variant="contained" color="warning" startIcon={<CertIcon/>} onClick={onViewCerts} size="small">View certificate</Button>
        </Paper>
      )}
      {passed&&!cert&&<Alert severity="warning" sx={{mb:3}}>Certificates are disabled — enable them in Settings.</Alert>}
      <Paper elevation={2} sx={{p:3,mb:3,background:`linear-gradient(135deg, ${BRAND.black} 0%, #2A0A0F 100%)`,color:'white',borderRadius:2,border:`1px solid ${BRAND.red}40`}}>
        <Box sx={{display:'flex',alignItems:'center',gap:1,mb:.5,opacity:.8}}><SparkleIcon fontSize="small"/><Typography variant="overline">Suggested next</Typography></Box>
        <Typography variant="h6" fontWeight={700}>{next.module.title}</Typography>
        <Typography variant="body2" sx={{opacity:.9,mb:2}}>{next.reason}</Typography>
        <Button variant="contained" sx={{bgcolor:BRAND.red,color:'white','&:hover':{bgcolor:BRAND.redDark}}} onClick={onHome}>Go to dashboard →</Button>
      </Paper>
      <Box sx={{display:'flex',gap:2,flexWrap:'wrap'}}>
        <Button variant="contained" startIcon={<RefreshIcon/>} onClick={onRetry} sx={{bgcolor:col.main,'&:hover':{bgcolor:col.dark}}}>Retry module</Button>
        <Button variant="outlined" startIcon={<BookIcon/>} onClick={onLearn}>Re-read lessons</Button>
        <Button onClick={onHome} color="inherit">Dashboard</Button>
      </Box>
    </Box>
  );
}

// ─── ANALYTICS VIEW ───────────────────────────────────────────────────────────
function AnalyticsView({ attempts, modules: modulesProp, passMark=60 }) {
  const { modules: modulesCtx } = useModules();
  const modules = modulesProp || modulesCtx;
  const suggestions=useMemo(()=>suggestNext(attempts,modules),[attempts,modules]);
  const trendData=useMemo(()=>{
    const sorted=[...attempts].sort((a,b)=>a.ts-b.ts);
    return sorted.map((a,i)=>{
      const row={label:new Date(a.ts).toLocaleDateString()};
      modules.forEach(m=>{const up=sorted.slice(0,i+1).filter(x=>x.moduleId===m.id);if(up.length)row[m.id]=up[up.length-1].pct;});
      return row;
    });
  },[attempts,modules]);
  const radarData=modules.map(m=>({module:m.title.split(' ').slice(-1)[0],score:moduleStats(attempts,m.id).latest??0}));
  const barData=modules.map(m=>{const s=moduleStats(attempts,m.id);return{name:m.title.split(' ').slice(-1)[0],avg:s.avg??0,best:s.best??0};});
  if(!attempts.length) return (
    <Box sx={{textAlign:'center',py:8}}><BarChartIcon sx={{fontSize:64,color:'text.disabled',mb:2}}/><Typography variant="h5" gutterBottom>No data yet</Typography><Typography color="text.secondary">Complete at least one module to see your trend analysis.</Typography></Box>
  );
  return (
    <Box>
      <Typography variant="h4" sx={{mb:4}}>Trend Analysis</Typography>
      <Typography variant="h5" sx={{mb:2,display:'flex',alignItems:'center',gap:1}}><SparkleIcon color="primary"/> Recommended training plan</Typography>
      <Grid container spacing={2} sx={{mb:4}}>
        {suggestions.map((s,i)=>{
          const col=getCol(s.module.id); const Icon=s.module.icon;
          return (
            <Grid item xs={12} sm={6} key={s.module.id}>
              <Paper elevation={i===0?3:1} variant={i===0?'elevation':'outlined'} sx={{p:2,display:'flex',alignItems:'flex-start',gap:2,borderLeft:i===0?`4px solid ${col.main}`:undefined}}>
                <Box sx={{width:32,height:32,borderRadius:1,bgcolor:col.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Typography fontWeight={700} sx={{color:col.main}}>{i+1}</Typography></Box>
                <Box sx={{flex:1}}>
                  <Box sx={{display:'flex',alignItems:'center',gap:1,mb:.25}}><Icon sx={{color:col.main,fontSize:18}}/><Typography variant="subtitle2">{s.module.title}</Typography>{i===0&&<Chip label="Priority" size="small" color="primary"/>}</Box>
                  <Typography variant="caption" color="text.secondary">{s.reason}</Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      <Typography variant="h5" sx={{mb:2}}>Score over time</Typography>
      <Paper elevation={1} sx={{p:3,mb:3}}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0"/><XAxis dataKey="label" tick={{fontSize:11}}/><YAxis domain={[0,100]} tick={{fontSize:11}}/><RechartTooltip contentStyle={{fontSize:12,borderRadius:8}}/><Legend wrapperStyle={{fontSize:12}}/>
            {modules.map(m=><Line key={m.id} type="monotone" dataKey={m.id} name={m.title.split(' ').slice(-1)[0]} stroke={getCol(m.id).main} strokeWidth={2} dot={{r:3}} connectNulls/>)}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{p:3}}>
            <Typography variant="h6" sx={{mb:2}}>Current strengths</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}><PolarGrid/><PolarAngleAxis dataKey="module" tick={{fontSize:11}}/><PolarRadiusAxis domain={[0,100]} tick={{fontSize:9}}/><Radar name="Latest" dataKey="score" stroke="#1565C0" fill="#1565C0" fillOpacity={.2}/></RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{p:3}}>
            <Typography variant="h6" sx={{mb:2}}>Average vs best</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis domain={[0,100]} tick={{fontSize:11}}/><RechartTooltip contentStyle={{fontSize:12,borderRadius:8}}/><Legend wrapperStyle={{fontSize:12}}/><Bar dataKey="avg" name="Average" fill="#F57C00" radius={[4,4,0,0]}/><Bar dataKey="best" name="Best" fill="#00897B" radius={[4,4,0,0]}/></BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── SETTINGS VIEW ────────────────────────────────────────────────────────────
function SettingsView({ user, showSnack, onLogout, onBack, settings, onSave }) {
  const [confirmWipeProgress, setConfirmWipeProgress] = useState(false);
  const [confirmWipeAccount,  setConfirmWipeAccount]  = useState(false);
  const [busy, setBusy]     = useState(false);
  const [mode, setMode]     = useState(api.getMode());
  const [baseUrl, setUrl]   = useState(api.getBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testMsg, setTestMsg]       = useState('');
  const currentMode = api.getMode();

  // Org settings
  const [passMark, setPassMark]   = useState(settings?.passMark ?? 60);
  const [orgName, setOrgName]     = useState(settings?.orgName ?? 'Comp X');
  const [certEnabled, setCertEnabled] = useState(settings?.certEnabled !== false);
  const [lbEnabled, setLbEnabled]   = useState(settings?.leaderboardEnabled !== false);

  useEffect(()=>{
    if(settings){ setPassMark(settings.passMark??60); setOrgName(settings.orgName??'Comp X'); setCertEnabled(settings.certEnabled!==false); setLbEnabled(settings.leaderboardEnabled!==false); }
  },[settings]);

  function saveOrgSettings(){
    onSave({...settings, passMark:Number(passMark), orgName, certEnabled, leaderboardEnabled:lbEnabled});
  }
  function saveDb() { api.setMode(mode); api.setBaseUrl(baseUrl); setTestResult(null); showSnack(mode==='remote'?`Switched to Remote SQL — ${baseUrl||'(no URL)'}`:'Switched to Local storage'); }
  async function testConn() {
    if (!baseUrl) { showSnack('Enter a server URL first','warning'); return; }
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch(`${baseUrl.replace(/\/$/,'')}/api/me`,{headers:{Authorization:`Bearer ${api.getToken()||''}`}});
      if (r.ok||r.status===401) { setTestResult('ok'); setTestMsg(r.ok?'Connected and authenticated ✓':'Server reachable ✓'); }
      else { setTestResult('fail'); setTestMsg(`HTTP ${r.status}`); }
    } catch(e) { setTestResult('fail'); setTestMsg(e.message); }
    setTesting(false);
  }
  async function wipeProgress() {
    setBusy(true);
    try { await api.wipeProgress(); showSnack('Training progress wiped'); setConfirmWipeProgress(false); }
    catch(e) { showSnack('Failed: '+e.message,'error'); }
    setBusy(false);
  }
  async function wipeAccount() {
    setBusy(true);
    try { await api.wipeAccount(); showSnack('Account deleted','info'); onLogout(); }
    catch(e) { showSnack('Failed: '+e.message,'error'); }
    setBusy(false);
  }
  return (
    <Box>
      <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:3}}>Dashboard</Button>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      {/* Account */}
      <Paper elevation={1} sx={{p:3,mb:3}}>
        <Typography variant="h6" gutterBottom sx={{display:'flex',alignItems:'center',gap:1}}><PersonIcon fontSize="small"/> Account</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Username</Typography><Typography fontWeight={600}>{user?.username}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Role</Typography><Chip label={user?.role} color={user?.role==='admin'?'primary':'default'} size="small"/></Grid>
          <Grid item xs={12}><Typography variant="body2" color="text.secondary">Storage</Typography><Chip icon={<StorageIcon sx={{fontSize:14}}/>} label={currentMode==='remote'?`Remote SQL — ${api.getBaseUrl()||'(no URL)'}`:'Local (browser)'} color={currentMode==='remote'?'info':'default'} size="small" sx={{mt:.25}}/></Grid>
        </Grid>
      </Paper>

      {/* Training settings */}
      <Paper elevation={1} sx={{p:3,mb:3,borderLeft:'4px solid',borderColor:'primary.main'}}>
        <Typography variant="h6" gutterBottom>Training configuration</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Pass mark (%)" type="number" inputProps={{min:1,max:100}} value={passMark} onChange={e=>setPassMark(e.target.value)} helperText="Score required to pass a module"/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Organisation name" value={orgName} onChange={e=>setOrgName(e.target.value)} helperText="Appears on certificates"/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{pt:.5}}>
              <FormControlLabel control={<Switch checked={certEnabled} onChange={e=>setCertEnabled(e.target.checked)}/>} label="Issue certificates on pass"/>
              <FormControlLabel control={<Switch checked={lbEnabled} onChange={e=>setLbEnabled(e.target.checked)}/>} label="Enable leaderboard"/>
            </Box>
          </Grid>
        </Grid>
        <Button variant="contained" startIcon={<SaveIcon/>} onClick={saveOrgSettings} sx={{mt:2}}>Save training settings</Button>
      </Paper>

      {/* DB config */}
      <Paper elevation={1} sx={{p:3,mb:3,borderLeft:'4px solid',borderColor:'info.main'}}>
        <Typography variant="h6" gutterBottom sx={{display:'flex',alignItems:'center',gap:1,color:'info.main'}}><StorageIcon fontSize="small"/> Database / Storage</Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb:2}}>Choose where users, passwords and training progress are stored.</Typography>
        <Box sx={{display:'flex',gap:1.5,mb:3}}>
          {[{val:'local',label:'Local (browser)',desc:'This browser only. No server needed.'},{val:'remote',label:'Remote SQL server',desc:'Shared database via server.js backend.'}].map(opt=>(
            <Paper key={opt.val} variant="outlined" onClick={()=>setMode(opt.val)}
              sx={{flex:1,p:2,cursor:'pointer',border:'2px solid',borderColor:mode===opt.val?'info.main':'divider',bgcolor:mode===opt.val?'rgba(41,182,246,0.08)':'background.paper',transition:'all .15s'}}>
              <Box sx={{display:'flex',alignItems:'center',gap:1,mb:.5}}>
                {mode===opt.val?<CheckCircle sx={{color:'info.main',fontSize:18}}/>:<RadioButtonUnchecked sx={{color:'text.disabled',fontSize:18}}/>}
                <Typography variant="subtitle2" fontWeight={700}>{opt.label}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
            </Paper>
          ))}
        </Box>
        {mode==='remote'&&<Box sx={{mb:2}}>
          <TextField fullWidth size="small" label="Server base URL" placeholder="http://localhost:3001" value={baseUrl} onChange={e=>{setUrl(e.target.value);setTestResult(null);}} helperText="URL where server.js is running" sx={{mb:1.5}}/>
          <Box sx={{display:'flex',gap:1,alignItems:'center'}}>
            <Button variant="outlined" size="small" color="info" startIcon={testing?<CircularProgress size={14} color="inherit"/>:<CheckCircleOutline/>} onClick={testConn} disabled={testing||!baseUrl}>Test connection</Button>
            {testResult==='ok'&&<Alert severity="success" sx={{py:.25,px:1,fontSize:12}}>{testMsg}</Alert>}
            {testResult==='fail'&&<Alert severity="error" sx={{py:.25,px:1,fontSize:12}}>{testMsg}</Alert>}
          </Box>
          <Alert severity="info" sx={{mt:2}}><AlertTitle>Server setup</AlertTitle>Run <code>node server.js</code>. Uses SQLite by default or PostgreSQL via <code>DB_URL</code> env var.</Alert>
        </Box>}
        {mode==='local'&&<Alert severity="warning" sx={{mb:2}}>Local mode stores all data in this browser only. For multi-user deployments, use Remote SQL.</Alert>}
        <Button variant="contained" color="info" startIcon={<SaveIcon/>} onClick={saveDb} disabled={mode===currentMode&&baseUrl===api.getBaseUrl()}>Save database settings</Button>
      </Paper>

      {/* Wipe */}
      <Paper elevation={1} sx={{p:3,mb:3,borderLeft:'4px solid',borderColor:'warning.main'}}>
        <Typography variant="h6" gutterBottom sx={{color:'warning.main'}}>Wipe training progress</Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb:2}}>Delete all your quiz attempts, scores and certificates. Your account is kept.</Typography>
        <Button variant="outlined" color="warning" startIcon={<DeleteIcon/>} onClick={()=>setConfirmWipeProgress(true)}>Wipe my progress</Button>
      </Paper>
      <Paper elevation={1} sx={{p:3,borderLeft:'4px solid',borderColor:'error.main'}}>
        <Typography variant="h6" gutterBottom sx={{color:'error.main'}}>Delete account</Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb:2}}>Permanently delete your account and all associated data.</Typography>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon/>} onClick={()=>setConfirmWipeAccount(true)}>Delete my account</Button>
      </Paper>
      <ConfirmDialog open={confirmWipeProgress} title="Wipe training progress?" body="All your quiz attempts, scores and certificates will be permanently deleted." onConfirm={wipeProgress} onCancel={()=>setConfirmWipeProgress(false)} busy={busy} confirmLabel="Yes, wipe progress" confirmColor="warning"/>
      <ConfirmDialog open={confirmWipeAccount} title="Delete your account?" body="Your account and all training data will be permanently deleted. You will be signed out immediately." onConfirm={wipeAccount} onCancel={()=>setConfirmWipeAccount(false)} busy={busy} confirmLabel="Yes, delete account" confirmColor="error"/>
    </Box>
  );
}

function AdminView({ user, showSnack, onBack, modules, settings, onSaveSettings }) {
  const [tab, setTab]               = useState(0);
  const [users, setUsers]           = useState([]);
  const [report, setReport]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [confirmTarget, setConfirm] = useState(null);
  const [busy, setBusy]             = useState(false);
  const [userDetail, setUserDetail] = useState(null); // user whose detail drawer is open
  const [userAttempts, setUserAttempts] = useState([]);

  // Settings state (mirrored locally so we can edit without saving)
  const [passMark, setPassMark]         = useState(settings?.passMark ?? 60);
  const [questionCount, setQuestionCount]= useState(settings?.questionCount ?? 30);
  const [orgName, setOrgName]           = useState(settings?.orgName ?? 'Comp X');
  const [certEnabled, setCertEnabled]   = useState(settings?.certEnabled !== false);
  const [lbEnabled, setLbEnabled]       = useState(settings?.leaderboardEnabled !== false);
  const [deadlines, setDeadlines]       = useState(settings?.deadlines ?? {});

  useEffect(()=>{
    if(settings){
      setPassMark(settings.passMark??60);
      setQuestionCount(settings.questionCount??30);
      setOrgName(settings.orgName??'Comp X');
      setCertEnabled(settings.certEnabled!==false);
      setLbEnabled(settings.leaderboardEnabled!==false);
      setDeadlines(settings.deadlines??{});
    }
  },[settings]);

  // Re-load whenever modules or settings arrive/change
  useEffect(() => {
    if (modules && modules.length > 0) load();
  }, [modules, settings?.passMark]);

  function load() {
    setLoading(true);
    try {
      const pm = settings?.passMark ?? 60;
      const moduleIds = (modules || []).map(m => m.id);
      const u = api.adminListUsers();
      const r = api.adminGetReport(moduleIds, pm);
      Promise.resolve(u).then(users => {
        Promise.resolve(r).then(rep => {
          setUsers(Array.isArray(users) ? users : []);
          setReport(Array.isArray(rep) ? rep : []);
          setLoading(false);
        }).catch(e => { showSnack('Report error: ' + e.message, 'error'); setLoading(false); });
      }).catch(e => { showSnack('Users error: ' + e.message, 'error'); setLoading(false); });
    } catch(e) {
      showSnack('Failed to load: ' + e.message, 'error');
      setLoading(false);
    }
  }

  async function openUserDetail(u) {
    setUserDetail(u);
    // Load full attempt history for this user
    try {
      const all = await api.adminListUsers(); // re-use local data
      // get attempts from report
      const rUser = report?.find(r=>r.user.id===u.id);
      setUserAttempts(rUser ? rUser.modules : []);
    } catch {}
  }

  async function execConfirm() {
    if (!confirmTarget) return;
    setBusy(true);
    try {
      if (confirmTarget.action==='wipe') {
        await api.adminWipeUserProgress(confirmTarget.user.id);
        showSnack(`Progress wiped for ${confirmTarget.user.username}`);
      } else {
        await api.adminDeleteUser(confirmTarget.user.id);
        showSnack(`User ${confirmTarget.user.username} deleted`);
        if(userDetail?.id===confirmTarget.user.id) setUserDetail(null);
      }
      setConfirm(null); load();
    } catch(e) { showSnack('Failed: '+e.message,'error'); }
    setBusy(false);
  }

  async function promoteUser(u) {
    // local only — in remote mode this would need an endpoint
    try {
      const users = JSON.parse(localStorage.getItem('cbt:users')||'[]');
      const updated = users.map(x=>x.id===u.id?{...x,role:'admin'}:x);
      localStorage.setItem('cbt:users', JSON.stringify(updated));
      showSnack(`${u.username} promoted to admin`);
      load();
    } catch(e) { showSnack('Only available in local mode','warning'); }
  }

  function saveOrgSettings() {
    onSaveSettings({...settings, passMark:Number(passMark), questionCount:Number(questionCount)||30, orgName, certEnabled, leaderboardEnabled:lbEnabled, deadlines});
  }

  function exportCsv() {
    if(!report)return;
    const rows=[['Username','Display Name','Role','Registered','Module','Attempts','Best %','Latest %','Passed','Certified','Cert Date','Last Attempt']];
    report.forEach(r=>{
      r.modules.forEach(m=>{
        const mod=modules.find(x=>x.id===m.moduleId)||{title:m.moduleId};
        rows.push([r.user.username,r.user.displayName||'',r.user.role,r.user.createdAt?new Date(r.user.createdAt).toLocaleDateString('en-GB'):'',mod.title,m.attempts,m.best??'',m.latestPct??'',m.passed?'Yes':'No',m.certified?'Yes':'No',m.certDate?new Date(m.certDate).toLocaleDateString('en-GB'):'',m.latestTs?new Date(m.latestTs).toLocaleDateString('en-GB'):'']);
      });
    });
    const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download=`CompX-Admin-Report-${new Date().toISOString().slice(0,10)}.csv`;a.click();
    showSnack('Report exported');
  }

  if (user?.role!=='admin') return <Alert severity="error">Admin access required.</Alert>;

  // Derived metrics
  const totalUsers     = users.length;
  const activeUsers    = report?.filter(r=>r.totalAttempts>0).length ?? 0;
  const fullyCompleted = report?.filter(r=>r.allPassed).length ?? 0;
  const totalAttempts  = report?.reduce((s,r)=>s+r.totalAttempts,0) ?? 0;
  const avgScore = (() => {
    if(!report)return 0;
    const all=report.flatMap(r=>r.modules.map(m=>m.latestPct)).filter(v=>v!=null);
    return all.length?Math.round(all.reduce((s,v)=>s+v,0)/all.length):0;
  })();
  const totalCerts = report?.reduce((s,r)=>s+r.modules.filter(m=>m.certified).length,0)??0;
  const avgTime = (() => {
    if(!report)return 0;
    const times=report.flatMap(r=>r.modules.map(m=>m.duration)).filter(v=>v);
    return times.length?Math.round(times.reduce((s,v)=>s+v,0)/times.length):0;
  })();

  // Hardest questions — which modules have lowest average scores
  const moduleMetrics = modules.map(m=>{
    const mr=report?.flatMap(r=>r.modules.filter(x=>x.moduleId===m.id)) ?? [];
    const withScores=mr.filter(x=>x.latestPct!=null);
    const avg=withScores.length?Math.round(withScores.reduce((s,x)=>s+x.latestPct,0)/withScores.length):null;
    const passRate=mr.length?Math.round(mr.filter(x=>x.passed).length/mr.length*100):null;
    const col=getCol(m.id);
    return {module:m,avg,passRate,attempted:withScores.length,total:totalUsers,col};
  });

  // Users not started
  const notStarted = report?.filter(r=>r.totalAttempts===0) ?? [];
  // Users below pass mark on any module
  const atRisk = report?.filter(r=>!r.allPassed&&r.totalAttempts>0) ?? [];
  // Overdue (deadline passed, not completed)
  const overdue = report?.filter(r=>{
    return modules.some(m=>{
      const dl=deadlines[m.id];
      if(!dl)return false;
      const modData=r.modules.find(x=>x.moduleId===m.id);
      return new Date(dl)<new Date() && !modData?.passed;
    });
  }) ?? [];

  function fmtTime(s){if(!s||s<0)return'—';const m=Math.floor(s/60);return m>0?`${m}m ${s%60}s`:`${s}s`;}

  return (
    <Box sx={{pb:4}}>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:3,flexWrap:'wrap',gap:2}}>
        <Box>
          <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:1}}>Dashboard</Button>
          <Typography variant="h4" sx={{display:'flex',alignItems:'center',gap:1}}><AdminIcon color="primary"/> Admin Panel</Typography>
        </Box>
        <Box sx={{display:'flex',gap:1}}>
          <Button startIcon={<RefreshIcon/>} onClick={load} variant="outlined" size="small" disabled={loading}>Refresh</Button>
          <Button startIcon={<ExportIcon/>} onClick={exportCsv} variant="outlined" size="small" disabled={!report}>Export CSV</Button>
        </Box>
      </Box>

      {/* ── SUMMARY METRICS ── */}
      <Grid container spacing={2} sx={{mb:3}}>
        {[
          {label:'Total users',      value:totalUsers,          icon:<PeopleIcon/>,      color:'primary.main'},
          {label:'Active users',     value:activeUsers,         icon:<FlameIcon/>,        color:'warning.main'},
          {label:'Fully completed',  value:`${fullyCompleted}/${totalUsers}`, icon:<CertIcon/>, color:'success.main'},
          {label:'Average score',    value:`${avgScore}%`,      icon:<TrophyIcon/>,      color:avgScore>=passMark?'success.main':'error.main'},
          {label:'Total attempts',   value:totalAttempts,       icon:<BarChartIcon/>,    color:'info.main'},
          {label:'Certificates',     value:totalCerts,          icon:<CertIcon/>,         color:'warning.main'},
          {label:'Avg time / module',value:fmtTime(avgTime),   icon:<TimerIcon/>,        color:'text.secondary'},
          {label:'At risk',          value:atRisk.length,       icon:<WarningIcon/>,     color:atRisk.length?'error.main':'success.main'},
        ].map(s=>(
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper elevation={1} sx={{p:2,display:'flex',alignItems:'center',gap:1.5}}>
              <Box sx={{color:s.color,display:'flex'}}>{s.icon}</Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{display:'block',textTransform:'uppercase',letterSpacing:.6,fontSize:10}}>{s.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{color:s.color,lineHeight:1.2}}>{loading?'…':s.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── ALERT BANDS ── */}
      {!loading && overdue.length>0 && <Alert severity="error" sx={{mb:2}} icon={<DeadlineIcon/>}><strong>{overdue.length} user{overdue.length!==1?'s':''} overdue</strong> on at least one module: {overdue.map(r=>r.user.displayName||r.user.username).join(', ')}</Alert>}
      {!loading && notStarted.length>0 && <Alert severity="warning" sx={{mb:2}} icon={<WarningIcon/>}><strong>{notStarted.length} user{notStarted.length!==1?'s':''} haven't started any module yet:</strong> {notStarted.map(r=>r.user.displayName||r.user.username).join(', ')}</Alert>}

      {/* ── TABS ── */}
      <Paper elevation={1} sx={{mb:3}}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{borderBottom:'1px solid',borderColor:'divider',px:1}} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" sx={{textTransform:'none',fontWeight:600}}/>
          <Tab label={<Box sx={{display:'flex',alignItems:'center',gap:.5}}>Users{users.filter(u=>u.status==='pending').length>0&&<Chip label={users.filter(u=>u.status==='pending').length} color="error" size="small" sx={{height:16,fontSize:10}}/>}</Box>} sx={{textTransform:'none',fontWeight:600}}/>
          <Tab label="Pending approvals" sx={{textTransform:'none',fontWeight:600}}/>
          <Tab label="Module metrics" sx={{textTransform:'none',fontWeight:600}}/>
          <Tab label="Completion matrix" sx={{textTransform:'none',fontWeight:600}}/>
          <Tab label="Settings" sx={{textTransform:'none',fontWeight:600}}/>
        </Tabs>

        <Box sx={{p:3}}>

          {/* ── TAB 0: OVERVIEW ── */}
          {tab===0&&(loading?<CircularProgress/>:(
            <Grid container spacing={3}>
              {/* Module pass-rate bars */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Module pass rates</Typography>
                {moduleMetrics.map(({module:m,avg,passRate,attempted,total,col})=>(
                  <Box key={m.id} sx={{mb:2.5}}>
                    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:.5}}>
                      <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                        <m.icon sx={{color:col.main,fontSize:18}}/>
                        <Typography variant="body2" fontWeight={600}>{m.title}</Typography>
                      </Box>
                      <Box sx={{display:'flex',gap:1,alignItems:'center'}}>
                        <Chip label={avg!=null?`avg ${avg}%`:'No data'} size="small" sx={{bgcolor:col.light,color:col.dark}}/>
                        <Chip label={passRate!=null?`${passRate}% pass`:'—'} size="small" color={passRate>=80?'success':passRate>=50?'warning':'error'} variant="outlined"/>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={passRate??0} sx={{height:10,borderRadius:5,'& .MuiLinearProgress-bar':{bgcolor:col.main}}}/>
                    <Typography variant="caption" color="text.secondary">{attempted}/{total} users attempted</Typography>
                  </Box>
                ))}
              </Grid>

              {/* At-risk users */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{display:'flex',alignItems:'center',gap:1}}>
                  <WarningIcon color="warning" fontSize="small"/> At-risk users
                </Typography>
                {atRisk.length===0
                  ? <Alert severity="success">All active users are on track.</Alert>
                  : <List disablePadding>
                    {atRisk.map((r,i)=>{
                      const failedMods=r.modules.filter(m=>m.attempts>0&&!m.passed);
                      return (
                        <React.Fragment key={r.user.id}>
                          {i>0&&<Divider/>}
                          <ListItem secondaryAction={
                            <Button size="small" variant="outlined" color="warning" onClick={()=>openUserDetail(r.user)}>View</Button>
                          }>
                            <ListItemIcon><Avatar sx={{width:28,height:28,fontSize:12,bgcolor:BRAND.red}}>{r.user.username?.[0]?.toUpperCase()}</Avatar></ListItemIcon>
                            <ListItemText
                              primary={r.user.displayName||r.user.username}
                              secondary={failedMods.map(m=>{const mod=modules.find(x=>x.id===m.moduleId);return `${mod?.title||m.moduleId}: ${m.latestPct??'—'}%`;}).join(' · ')}
                            />
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>
                }

                {/* Recent activity feed */}
                <Typography variant="h6" gutterBottom sx={{mt:3}}>Recent activity</Typography>
                {(() => {
                  if(!report)return null;
                  const events=report.flatMap(r=>r.modules.filter(m=>m.latestTs).map(m=>({user:r.user,module:modules.find(x=>x.id===m.moduleId),pct:m.latestPct,passed:m.passed,ts:m.latestTs}))).sort((a,b)=>b.ts-a.ts).slice(0,8);
                  return events.length===0?<Typography color="text.secondary" variant="body2">No attempts yet.</Typography>:(
                    <List dense disablePadding>
                      {events.map((e,i)=>{
                        const col=getCol(e.module?.id);
                        return (
                          <React.Fragment key={i}>{i>0&&<Divider/>}
                            <ListItem dense>
                              <ListItemIcon sx={{minWidth:32}}>
                                {e.module&&<e.module.icon sx={{color:col.main,fontSize:18}}/>}
                              </ListItemIcon>
                              <ListItemText
                                primary={<Typography variant="body2"><strong>{e.user.displayName||e.user.username}</strong> — {e.module?.title||'Unknown'}</Typography>}
                                secondary={new Date(e.ts).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                              />
                              <ScoreChip pct={e.pct??0}/>
                            </ListItem>
                          </React.Fragment>
                        );
                      })}
                    </List>
                  );
                })()}
              </Grid>
            </Grid>
          ))}

          {/* ── TAB 1: USERS ── */}
          {tab===1&&(loading?<CircularProgress/>:(
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell align="center">Attempts</TableCell>
                    <TableCell align="center">Avg score</TableCell>
                    <TableCell align="center">Certs</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u=>{
                    const rUser=report?.find(r=>r.user.id===u.id);
                    const userAvg=rUser?(() => {const s=rUser.modules.filter(m=>m.latestPct!=null);return s.length?Math.round(s.reduce((sum,m)=>sum+m.latestPct,0)/s.length):null;})():null;
                    const userCerts=rUser?.modules.filter(m=>m.certified).length??0;
                    const status=rUser?.allPassed?'complete':rUser?.totalAttempts>0?'in progress':'not started';
                    const statusColor={complete:'success',['in progress']:'warning',['not started']:'default'};
                    return (
                      <TableRow key={u.id} hover sx={{cursor:'pointer'}} onClick={()=>openUserDetail(u)}>
                        <TableCell>
                          <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                            <Avatar sx={{width:28,height:28,fontSize:12,bgcolor:u.role==='admin'?BRAND.red:'grey.700'}}>{(u.displayName||u.username)?.[0]?.toUpperCase()}</Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{u.displayName||u.username}</Typography>
                              {u.displayName&&<Typography variant="caption" color="text.secondary">@{u.username}</Typography>}
                            </Box>
                            {u.id===user.id&&<Chip label="You" size="small" sx={{height:16,fontSize:10}}/>}
                          </Box>
                        </TableCell>
                        <TableCell><Chip label={u.role} color={u.role==='admin'?'primary':'default'} size="small"/></TableCell>
                        <TableCell><Typography variant="body2">{u.createdAt?new Date(u.createdAt).toLocaleDateString('en-GB'):'—'}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" fontWeight={600}>{u.attempts??0}</Typography></TableCell>
                        <TableCell align="center">{userAvg!=null?<ScoreChip pct={userAvg}/>:<Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
                        <TableCell align="center">
                          <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:.5}}>
                            <CertIcon sx={{fontSize:16,color:userCerts>0?'warning.main':'text.disabled'}}/>
                            <Typography variant="body2">{userCerts}/{modules.length}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center"><Chip label={status} color={statusColor[status]} size="small" variant="outlined"/></TableCell>
                        <TableCell align="right" onClick={e=>e.stopPropagation()}>
                          {u.role!=='admin'&&api.getMode()==='local'&&<Tooltip title="Promote to admin"><IconButton size="small" onClick={()=>promoteUser(u)}><AdminIcon fontSize="small"/></IconButton></Tooltip>}
                          <Tooltip title="Wipe progress"><IconButton size="small" color="warning" onClick={()=>setConfirm({user:u,action:'wipe'})} disabled={u.id===user.id}><DeleteIcon fontSize="small"/></IconButton></Tooltip>
                          <Tooltip title="Delete user"><IconButton size="small" color="error" onClick={()=>setConfirm({user:u,action:'delete'})} disabled={u.id===user.id}><PersonIcon fontSize="small"/></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ))}

          {/* ── TAB 2: PENDING APPROVALS ── */}
          {tab===2&&(
            <Box>
              {users.filter(u=>u.status==='pending').length===0
                ? <Alert severity="success" icon={<CheckCircle/>}>No users awaiting approval.</Alert>
                : <>
                  <Alert severity="warning" sx={{mb:2}}>
                    The following users have registered and are waiting for admin approval before they can sign in.
                  </Alert>
                  <List disablePadding>
                    {users.filter(u=>u.status==='pending').map((u,i)=>(
                      <React.Fragment key={u.id}>
                        {i>0&&<Divider/>}
                        <ListItem secondaryAction={
                          <Box sx={{display:'flex',gap:1}}>
                            <Button variant="contained" color="success" size="small" startIcon={<CheckCircle/>}
                              onClick={async()=>{ await api.adminApproveUser(u.id); showSnack(`${u.displayName||u.username} approved`,'success'); load(); }}>
                              Approve
                            </Button>
                            <Button variant="outlined" color="error" size="small" startIcon={<Cancel/>}
                              onClick={async()=>{ await api.adminRejectUser(u.id); showSnack(`${u.displayName||u.username} rejected`,'warning'); load(); }}>
                              Reject
                            </Button>
                            <Tooltip title="Delete user"><IconButton size="small" color="error" onClick={()=>setConfirm({user:u,action:'delete'})}><DeleteIcon fontSize="small"/></IconButton></Tooltip>
                          </Box>
                        }>
                          <ListItemIcon>
                            <Avatar sx={{bgcolor:'grey.700',width:32,height:32,fontSize:13}}>{(u.displayName||u.username)?.[0]?.toUpperCase()}</Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography fontWeight={600}>{u.displayName||u.username} <Typography component="span" variant="caption" color="text.secondary">(@{u.username})</Typography></Typography>}
                            secondary={`Registered ${u.createdAt ? new Date(u.createdAt).toLocaleString('en-GB') : '—'}`}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </>
              }
              {users.filter(u=>u.status==='rejected').length>0&&(
                <Box sx={{mt:3}}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Rejected users</Typography>
                  <List disablePadding>
                    {users.filter(u=>u.status==='rejected').map((u,i)=>(
                      <React.Fragment key={u.id}>
                        {i>0&&<Divider/>}
                        <ListItem secondaryAction={
                          <Box sx={{display:'flex',gap:1}}>
                            <Button variant="outlined" color="success" size="small" onClick={async()=>{ await api.adminApproveUser(u.id); showSnack(`${u.displayName||u.username} approved`,'success'); load(); }}>Re-approve</Button>
                            <Tooltip title="Delete user"><IconButton size="small" color="error" onClick={()=>setConfirm({user:u,action:'delete'})}><DeleteIcon fontSize="small"/></IconButton></Tooltip>
                          </Box>
                        }>
                          <ListItemIcon><Avatar sx={{bgcolor:'error.dark',width:32,height:32,fontSize:13}}>{(u.displayName||u.username)?.[0]?.toUpperCase()}</Avatar></ListItemIcon>
                          <ListItemText primary={u.displayName||u.username} secondary={`@${u.username} · Rejected`}/>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {/* ── TAB 2: MODULE METRICS ── */}
          {tab===5&&(loading?<CircularProgress/>:(
            <Grid container spacing={3}>
              {moduleMetrics.map(({module:m,avg,passRate,attempted,total,col})=>{
                const modReport=report?.flatMap(r=>r.modules.filter(x=>x.moduleId===m.id).map(x=>({...x,user:r.user})))||[];
                const scores=modReport.filter(x=>x.latestPct!=null).map(x=>x.latestPct);
                const dist={below60:0,p60to79:0,p80to100:0};
                scores.forEach(s=>{if(s<60)dist.below60++;else if(s<80)dist.p60to79++;else dist.p80to100++;});
                const avgDuration=modReport.filter(x=>x.duration).length?Math.round(modReport.filter(x=>x.duration).reduce((s,x)=>s+(x.duration||0),0)/modReport.filter(x=>x.duration).length):0;
                return (
                  <Grid item xs={12} md={6} key={m.id}>
                    <Paper variant="outlined" sx={{p:2.5,borderTop:`3px solid ${col.main}`}}>
                      <Box sx={{display:'flex',alignItems:'center',gap:1.5,mb:2}}>
                        <m.icon sx={{color:col.main,fontSize:28}}/>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{m.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{m.questions?.length||0} questions</Typography>
                        </Box>
                      </Box>
                      <Grid container spacing={1.5} sx={{mb:2}}>
                        {[
                          {label:'Avg score',val:avg!=null?`${avg}%`:'—'},
                          {label:'Pass rate',val:passRate!=null?`${passRate}%`:'—'},
                          {label:'Attempted',val:`${attempted}/${total}`},
                          {label:'Avg time',val:fmtTime(avgDuration)},
                        ].map(s=>(
                          <Grid item xs={6} key={s.label}>
                            <Paper elevation={0} sx={{p:1,bgcolor:'background.default',textAlign:'center',borderRadius:1}}>
                              <Typography variant="caption" color="text.secondary" sx={{display:'block'}}>{s.label}</Typography>
                              <Typography variant="subtitle1" fontWeight={700}>{s.val}</Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                      {/* Score distribution */}
                      <Typography variant="caption" color="text.secondary" sx={{display:'block',mb:.5}}>Score distribution</Typography>
                      <Box sx={{display:'flex',height:12,borderRadius:6,overflow:'hidden',mb:.5}}>
                        {scores.length>0?<>
                          <Box sx={{flex:dist.below60,bgcolor:'error.main',transition:'flex .3s'}}/>
                          <Box sx={{flex:dist.p60to79,bgcolor:'warning.main',transition:'flex .3s'}}/>
                          <Box sx={{flex:dist.p80to100,bgcolor:'success.main',transition:'flex .3s'}}/>
                        </>:<Box sx={{flex:1,bgcolor:'background.paper'}}/>}
                      </Box>
                      <Box sx={{display:'flex',gap:2}}>
                        <Typography variant="caption" color="error.main">Below {passMark}%: {dist.below60}</Typography>
                        <Typography variant="caption" color="warning.main">{passMark}–79%: {dist.p60to79}</Typography>
                        <Typography variant="caption" color="success.main">80%+: {dist.p80to100}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ))}

          {/* ── TAB 3: COMPLETION MATRIX ── */}
          {tab===3&&(loading?<CircularProgress/>:(
            <TableContainer sx={{maxHeight:600}}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{minWidth:160}}>User</TableCell>
                    {modules.map(m=>{
                      const col=getCol(m.id);
                      return <TableCell key={m.id} align="center" sx={{minWidth:90}}>
                        <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',gap:.25}}>
                          <m.icon sx={{color:col.main,fontSize:16}}/>
                          <Typography variant="caption" sx={{fontSize:10,lineHeight:1.2,textAlign:'center'}}>{m.title.split(' ').slice(-2).join(' ')}</Typography>
                        </Box>
                      </TableCell>;
                    })}
                    <TableCell align="center">Overall</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report?.map(r=>(
                    <TableRow key={r.user.id} hover sx={{cursor:'pointer'}} onClick={()=>openUserDetail(r.user)}>
                      <TableCell>
                        <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                          <Avatar sx={{width:22,height:22,fontSize:10,bgcolor:r.user.role==='admin'?BRAND.red:'grey.700'}}>{(r.user.displayName||r.user.username)?.[0]?.toUpperCase()}</Avatar>
                          <Typography variant="body2" noWrap>{r.user.displayName||r.user.username}</Typography>
                        </Box>
                      </TableCell>
                      {r.modules.map(m=>{
                        const col=getCol(m.moduleId);
                        const dl=deadlines[m.moduleId];
                        const isOverdue=dl&&new Date(dl)<new Date()&&!m.passed;
                        return (
                          <TableCell key={m.moduleId} align="center">
                            {m.attempts===0
                              ? <Typography variant="caption" color="text.disabled">—</Typography>
                              : <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',gap:.25}}>
                                  <Chip label={`${m.latestPct??'—'}%`} size="small" color={m.passed?'success':m.latestPct>=(passMark*.7)?'warning':'error'} sx={{minWidth:46,height:18,fontSize:10}}/>
                                  {m.certified&&<CertIcon sx={{fontSize:12,color:'warning.main'}}/>}
                                  {isOverdue&&<DeadlineIcon sx={{fontSize:12,color:'error.main'}}/>}
                                </Box>
                            }
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">
                        {r.allPassed
                          ? <CheckCircle sx={{color:'success.main',fontSize:20}}/>
                          : <Box sx={{display:'flex',alignItems:'center',justifyContent:'center',gap:.5}}>
                              <Typography variant="caption">{r.modules.filter(m=>m.passed).length}/{modules.length}</Typography>
                            </Box>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ))}

          {/* ── TAB 4: SETTINGS ── */}
          {tab===4&&(
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Training configuration</Typography>
                <Paper variant="outlined" sx={{p:2.5}}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Pass mark (%)" type="number" inputProps={{min:1,max:100}} value={passMark} onChange={e=>setPassMark(e.target.value)} helperText="Score required to pass"/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Organisation name" value={orgName} onChange={e=>setOrgName(e.target.value)} helperText="Appears on certificates"/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="App title" value={settings?.appTitle||'CyberCBT'} onChange={e=>onSaveSettings({...settings,appTitle:e.target.value})} helperText="Shown in the nav bar and login screen"/>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Questions per module</Typography>
                      <Box sx={{display:'flex',gap:1}}>
                        {[10,20,30].map(n=>(
                          <Paper key={n} variant="outlined" onClick={()=>setQuestionCount(n)}
                            sx={{flex:1,p:1.5,cursor:'pointer',textAlign:'center',border:'2px solid',borderColor:questionCount===n?'primary.main':'divider',bgcolor:questionCount===n?'rgba(212,0,43,0.08)':'background.paper',transition:'all .15s'}}>
                            <Typography variant="h5" fontWeight={700} sx={{color:questionCount===n?'primary.main':'text.secondary'}}>{n}</Typography>
                            <Typography variant="caption" color="text.secondary">questions</Typography>
                          </Paper>
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{mt:.5,display:'block'}}>Questions are drawn from the start of each module bank. Reducing saves time but covers fewer topics.</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel control={<Switch checked={certEnabled} onChange={e=>setCertEnabled(e.target.checked)} color="warning"/>} label="Issue certificates on passing a module"/>
                      <FormControlLabel control={<Switch checked={lbEnabled} onChange={e=>setLbEnabled(e.target.checked)} color="primary"/>} label="Enable leaderboard"/>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Training deadlines</Typography>
                <Paper variant="outlined" sx={{p:2.5}}>
                  <Typography variant="body2" color="text.secondary" sx={{mb:2}}>Set a deadline date for each module. Users who have not passed by this date are flagged as overdue.</Typography>
                  {modules.map(m=>{
                    const col=getCol(m.id);
                    return (
                      <Box key={m.id} sx={{display:'flex',alignItems:'center',gap:1.5,mb:2}}>
                        <m.icon sx={{color:col.main,fontSize:20,flexShrink:0}}/>
                        <TextField size="small" label={m.title.split(' ').slice(-2).join(' ')} type="date"
                          value={deadlines[m.id]||''} InputLabelProps={{shrink:true}}
                          onChange={e=>setDeadlines(d=>({...d,[m.id]:e.target.value||undefined}))}
                          sx={{flex:1}}/>
                        {deadlines[m.id]&&<Tooltip title="Clear deadline"><IconButton size="small" onClick={()=>setDeadlines(d=>{const n={...d};delete n[m.id];return n;})}><Cancel fontSize="small"/></IconButton></Tooltip>}
                      </Box>
                    );
                  })}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" startIcon={<SaveIcon/>} onClick={saveOrgSettings} size="large">Save all settings</Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* User detail dialog */}
      <Dialog open={!!userDetail} onClose={()=>setUserDetail(null)} maxWidth="sm" fullWidth>
        {userDetail&&(()=>{
          const rUser=report?.find(r=>r.user.id===userDetail.id);
          const uAvg=rUser?(() => {const s=rUser.modules.filter(m=>m.latestPct!=null);return s.length?Math.round(s.reduce((sum,m)=>sum+m.latestPct,0)/s.length):null;})():null;
          return <>
            <DialogTitle sx={{display:'flex',alignItems:'center',gap:1.5,borderBottom:'1px solid',borderColor:'divider'}}>
              <Avatar sx={{bgcolor:userDetail.role==='admin'?BRAND.red:'grey.700'}}>{(userDetail.displayName||userDetail.username)?.[0]?.toUpperCase()}</Avatar>
              <Box sx={{flex:1}}>
                <Typography variant="h6">{userDetail.displayName||userDetail.username}</Typography>
                <Typography variant="caption" color="text.secondary">@{userDetail.username} · {userDetail.role} · joined {userDetail.createdAt?new Date(userDetail.createdAt).toLocaleDateString('en-GB'):'unknown'}</Typography>
              </Box>
              {uAvg!=null&&<ScoreChip pct={uAvg}/>}
            </DialogTitle>
            <DialogContent sx={{pt:2}}>
              {rUser ? (
                <List disablePadding>
                  {rUser.modules.map(m=>{
                    const mod=modules.find(x=>x.id===m.moduleId)||{title:m.moduleId,icon:SecurityIcon};
                    const col=getCol(m.moduleId);
                    return (
                      <React.Fragment key={m.moduleId}>
                        <Divider/>
                        <ListItem>
                          <ListItemIcon><mod.icon sx={{color:col.main}}/></ListItemIcon>
                          <ListItemText
                            primary={mod.title}
                            secondary={m.attempts>0?`${m.attempts} attempt${m.attempts!==1?'s':''} · best ${m.best??'—'}% · ${m.latestTs?new Date(m.latestTs).toLocaleDateString('en-GB'):'—'}`:'Not attempted'}
                          />
                          <Box sx={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:.5}}>
                            {m.latestPct!=null&&<ScoreChip pct={m.latestPct}/>}
                            {m.certified&&<Chip icon={<CertIcon sx={{fontSize:12}}/>} label="Certified" size="small" color="warning" sx={{height:18,fontSize:10}}/>}
                            {m.passed&&!m.certified&&<Chip label="Passed" size="small" color="success" sx={{height:18,fontSize:10}}/>}
                          </Box>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : <Typography color="text.secondary">No attempts recorded.</Typography>}
            </DialogContent>
            <DialogActions sx={{justifyContent:'space-between',px:3}}>
              <Box sx={{display:'flex',gap:1}}>
                <Button color="warning" size="small" startIcon={<DeleteIcon/>} onClick={()=>{setUserDetail(null);setConfirm({user:userDetail,action:'wipe'});}} disabled={userDetail.id===user.id}>Wipe progress</Button>
                <Button color="error" size="small" startIcon={<DeleteIcon/>} onClick={()=>{setUserDetail(null);setConfirm({user:userDetail,action:'delete'});}} disabled={userDetail.id===user.id}>Delete user</Button>
              </Box>
              <Button onClick={()=>setUserDetail(null)}>Close</Button>
            </DialogActions>
          </>;
        })()}
      </Dialog>

      {confirmTarget&&<ConfirmDialog open={true}
        title={confirmTarget.action==='wipe'?`Wipe progress for ${confirmTarget.user.username}?`:`Delete user ${confirmTarget.user.username}?`}
        body={confirmTarget.action==='wipe'?'All their quiz attempts, scores and certificates will be permanently deleted.':'This will permanently delete the user and all their training data.'}
        onConfirm={execConfirm} onCancel={()=>setConfirm(null)} busy={busy}
        confirmLabel={confirmTarget.action==='wipe'?'Yes, wipe progress':'Yes, delete user'}
        confirmColor={confirmTarget.action==='wipe'?'warning':'error'}/>}
    </Box>
  );
}

// ─── XLSX / CSV IMPORT HELPERS ───────────────────────────────────────────────
/**
 * Parse an XLSX or CSV file into draft modules.
 * 
 * Expected column layout (row 1 = header, ignored):
 *   A: Module Title   B: Question Type (SA|MA)   C: Question Text
 *   D–M: Answer 1–10  (prefix * = correct answer)
 *   N: Explainer (optional)
 *
 * Multiple questions per module: repeat Module Title on each row.
 * New module when Module Title changes.
 */
function parseImportFile(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows  = XLSX.utils.sheet_to_json(sheet, { header:1, defval:'' });

  // Skip header row
  const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim()));

  const modulesMap = new Map(); // title → module draft
  const moduleOrder = [];

  for (const row of dataRows) {
    const moduleTitle = String(row[0]||'').trim();
    const qType       = String(row[1]||'').trim().toUpperCase();
    const qText       = String(row[2]||'').trim();
    const explainer   = String(row[13]||'').trim();

    if (!qText) continue; // skip empty question rows

    // Collect options — columns D(3) through M(12)
    const rawOptions = [];
    for (let i = 3; i <= 12; i++) {
      const cell = String(row[i]||'').trim();
      if (cell) rawOptions.push(cell);
    }
    if (rawOptions.length < 2) continue; // need at least 2 options

    // Parse correct answers (prefixed with *)
    const options = rawOptions.map(o => o.startsWith('*') ? o.slice(1).trim() : o);
    const correctIndices = rawOptions
      .map((o,i) => o.startsWith('*') ? i : -1)
      .filter(i => i >= 0);

    if (correctIndices.length === 0) continue; // must have at least one correct

    // Determine type: MA if multiple correct OR explicitly MA
    const isMulti = qType === 'MA' || correctIndices.length > 1;
    const answer  = isMulti ? correctIndices : correctIndices[0];

    const question = {
      type:     isMulti ? 'multi' : 'single',
      q:        qText,
      options,
      answer,
      explainer,
    };

    // Group by module
    const key = moduleTitle || 'Imported Module';
    if (!modulesMap.has(key)) {
      modulesMap.set(key, {
        id:       key.toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,32) + '_' + Math.random().toString(36).slice(2,6),
        title:    key,
        iconName: 'PhishingIcon',
        summary:  '',
        lessons:  [''],
        questions:[],
      });
      moduleOrder.push(key);
    }
    modulesMap.get(key).questions.push(question);
  }

  return moduleOrder.map(k => modulesMap.get(k));
}

/**
 * Generate a template XLSX with instructions sheet + example data.
 */
function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Instructions sheet ──
  const instrData = [
    ['CyberCBT Question Import Template'],
    [],
    ['INSTRUCTIONS'],
    ['Column', 'Field', 'Required', 'Notes'],
    ['A', 'Module Title', 'Yes', 'Group questions into modules. Repeat the same title for each question in that module.'],
    ['B', 'Question Type', 'Yes', 'SA = Single answer (one correct). MA = Multiple answers (one or more correct).'],
    ['C', 'Question Text', 'Yes', 'The full question text.'],
    ['D–M', 'Answer Choices', 'Yes', 'Up to 10 answer choices. Prefix correct answers with * (e.g. *True). At least 2 choices required.'],
    ['N', 'Explainer', 'No', 'Shown to the user after they answer. Explains why the correct answer is right.'],
    [],
    ['QUESTION TYPES'],
    ['SA', 'Single Answer — exactly one correct answer. Mark it with *.'],
    ['MA', 'Multiple Answers — one or more correct answers. Mark all correct answers with *.'],
    [],
    ['TIPS'],
    ['• At least 2 answer choices are required per question.'],
    ['• Up to 10 answer choices (columns D through M).'],
    ['• The first row is a header and is ignored — do not put questions there.'],
    ['• Module names must not be blank. Use the same name for all questions in a module.'],
    ['• Correct answers must be prefixed with * e.g.  *Paris  not  Paris'],
  ];
  const instrSheet = XLSX.utils.aoa_to_sheet(instrData);
  instrSheet['!cols'] = [{wch:10},{wch:18},{wch:12},{wch:70}];
  XLSX.utils.book_append_sheet(wb, instrSheet, 'Instructions');

  // ── Template sheet ──
  const templateData = [
    ['Module Title','Question Type','Question Text','Answer 1','Answer 2','Answer 3','Answer 4','Answer 5','Answer 6','Answer 7','Answer 8','Answer 9','Answer 10','Explainer'],
    ['Phishing Awareness','SA','Which of the following is a sign of a phishing email?','It comes from a known sender','*It creates a sense of urgency','It has a company logo','It is well written','','','','','','','Urgency is a classic phishing tactic designed to make you act without thinking.'],
    ['Phishing Awareness','MA','Which of these are safe ways to verify a suspicious link? (Select all that apply)','*Hover over the link to check the URL','*Paste into a URL scanner','Click it quickly to check','Ask a colleague to click it','','','','','','','Hovering and URL scanners are safe. Clicking — even quickly — is not.'],
    ['Password Security','SA','What password approach does NCSC recommend?','8 characters with symbols','*Three random words','Your pet name and year of birth','A complex password you rotate monthly','','','','','','','Three random words creates a long, memorable passphrase that resists cracking.'],
  ];
  const tmplSheet = XLSX.utils.aoa_to_sheet(templateData);
  tmplSheet['!cols'] = [{wch:22},{wch:16},{wch:50},{wch:35},{wch:35},{wch:20},{wch:20},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:50}];
  XLSX.utils.book_append_sheet(wb, tmplSheet, 'Questions');

  XLSX.writeFile(wb, 'CyberCBT-Question-Template.xlsx');
}

/**
 * Export current draft to XLSX in the same import format.
 */
function exportToXlsx(draftModules) {
  const wb = XLSX.utils.book_new();
  const rows = [
    ['Module Title','Question Type','Question Text','Answer 1','Answer 2','Answer 3','Answer 4','Answer 5','Answer 6','Answer 7','Answer 8','Answer 9','Answer 10','Explainer'],
  ];
  for (const m of draftModules) {
    for (const q of (m.questions||[])) {
      const type    = q.type==='multi' ? 'MA' : 'SA';
      const answers = q.options.map((opt,i) => {
        const isCorrect = q.type==='multi'
          ? (Array.isArray(q.answer) && q.answer.includes(i))
          : q.answer === i;
        return isCorrect ? `*${opt}` : opt;
      });
      // Pad to 10
      while (answers.length < 10) answers.push('');
      rows.push([m.title, type, q.q, ...answers, q.explainer||'']);
    }
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{wch:22},{wch:16},{wch:50},...Array(10).fill({wch:30}),{wch:50}];
  XLSX.utils.book_append_sheet(wb, sheet, 'Questions');
  XLSX.writeFile(wb, 'CyberCBT-Questions.xlsx');
}

// ─── QUESTION BANK MANAGER ────────────────────────────────────────────────────
const BLANK_Q = { type:'single', q:'', options:['','','',''], answer:0, explainer:'' };
function uid8() { return Math.random().toString(36).slice(2,10); }

function QBankView({ showSnack, onBack }) {
  const { modules, setModules } = useModules();
  const [draft, setDraft]       = useState(() => JSON.parse(JSON.stringify(
    modules.map(m=>({...m,iconName:Object.entries(ICON_MAP).find(([,v])=>v===m.icon)?.[0]||'PhishingIcon'}))
  )));
  const [selModIdx, setSelModIdx] = useState(0);
  const [selQIdx, setSelQIdx]     = useState(null);
  const [tab, setTab]             = useState(0);
  const [jsonText, setJsonText]   = useState('');
  const [jsonErr, setJsonErr]     = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  // Import state
  const [importPreview, setImportPreview] = useState(null);  // parsed modules before apply
  const [importErr, setImportErr]         = useState('');
  const [importMode, setImportMode]       = useState('replace'); // 'replace' | 'append'
  const selMod = draft[selModIdx] || null;

  function updateMod(field, val) { setDraft(d=>d.map((m,i)=>i===selModIdx?{...m,[field]:val}:m)); }
  function addModule() { const m={id:uid8(),title:'New Module',iconName:'PhishingIcon',summary:'',lessons:[''],questions:[]}; setDraft(d=>[...d,m]); setSelModIdx(draft.length); setSelQIdx(null); }
  function deleteModule(idx) { if(draft.length<=1){showSnack('Must have at least one module','warning');return;} setDraft(d=>d.filter((_,i)=>i!==idx)); setSelModIdx(Math.max(0,selModIdx-(idx<=selModIdx?1:0))); setSelQIdx(null); }
  function addLesson() { updateMod('lessons',[...(selMod.lessons||[]),  '']); }
  function updateLesson(i,v) { updateMod('lessons',selMod.lessons.map((l,j)=>j===i?v:l)); }
  function removeLesson(i) { updateMod('lessons',selMod.lessons.filter((_,j)=>j!==i)); }
  function addQuestion() { const qs=[...(selMod.questions||[]),{...BLANK_Q}]; updateMod('questions',qs); setSelQIdx(qs.length-1); setTab(1); }
  function deleteQuestion(qi) { updateMod('questions',selMod.questions.filter((_,i)=>i!==qi)); setSelQIdx(null); }
  function dupQuestion(qi) { const copy=JSON.parse(JSON.stringify(selMod.questions[qi])); const qs=[...selMod.questions.slice(0,qi+1),copy,...selMod.questions.slice(qi+1)]; updateMod('questions',qs); setSelQIdx(qi+1); }
  function updateQ(qi,field,val) { updateMod('questions',selMod.questions.map((q,i)=>i===qi?{...q,[field]:val}:q)); }
  function updateOpt(qi,oi,val) { updateMod('questions',selMod.questions.map((q,i)=>i===qi?{...q,options:q.options.map((o,j)=>j===oi?val:o)}:q)); }
  function toggleMultiAns(qi,oi) { const q=selMod.questions[qi]; const cur=Array.isArray(q.answer)?q.answer:[q.answer]; const next=cur.includes(oi)?cur.filter(x=>x!==oi):[...cur,oi].sort((a,b)=>a-b); updateQ(qi,'answer',next); }
  function setQType(qi,type) { const q=selMod.questions[qi]; const ans=type==='multi'?(Array.isArray(q.answer)?q.answer:[q.answer]):(Array.isArray(q.answer)?q.answer[0]??0:q.answer); updateMod('questions',selMod.questions.map((qq,i)=>i===qi?{...qq,type,answer:ans}:qq)); }
  function addOpt(qi) { const q=selMod.questions[qi]; if((q.options||[]).length>=6)return; updateMod('questions',selMod.questions.map((qq,i)=>i===qi?{...qq,options:[...qq.options,'']}:qq)); }
  function removeOpt(qi,oi) { const q=selMod.questions[qi]; if(q.options.length<=2)return; updateMod('questions',selMod.questions.map((qq,i)=>i===qi?{...qq,options:qq.options.filter((_,j)=>j!==oi)}:qq)); }

  function saveAll() {
    const hydrated=draft.map(m=>({...m,icon:resolveIcon(m.iconName||'PhishingIcon')}));
    setModules(hydrated); saveQBank(hydrated); showSnack('Question bank saved — changes are live','success');
  }
  function resetToDefault() {
    setDraft(DEFAULT_MODULES.map(m=>({...m,iconName:Object.entries(ICON_MAP).find(([,v])=>v===m.icon)?.[0]||'PhishingIcon'})));
    setConfirmReset(false); showSnack('Draft reset to built-in bank (not yet saved)','info');
  }
  function openJson() { setJsonText(JSON.stringify(draft.map(({icon,...m})=>m),null,2)); setJsonErr(''); setTab(2); }
  function applyJson() {
    try {
      const parsed=JSON.parse(jsonText);
      if(!Array.isArray(parsed))throw new Error('Root must be a JSON array');
      for(const m of parsed){if(!m.id||!m.title||!Array.isArray(m.questions))throw new Error(`Module "${m.id||'?'}" missing id, title or questions`);}
      setDraft(parsed); setJsonErr(''); setTab(0); showSnack('JSON applied to draft — click Save to go live','info');
    } catch(e){setJsonErr(e.message);}
  }
  function downloadJson() {
    const blob=new Blob([JSON.stringify(draft.map(({icon,...m})=>m),null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cybercbt-questions.json';a.click();
    showSnack('Downloaded question bank JSON');
  }
  function handleJsonFile(e) {
    const f=e.target.files?.[0];if(!f)return;
    const fr=new FileReader();
    fr.onload=ev=>{setJsonText(ev.target.result);setTab(2);setJsonErr('');};
    fr.readAsText(f);
    e.target.value='';
  }

  // XLSX / CSV import
  function handleImportFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setImportErr(''); setImportPreview(null);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb   = XLSX.read(data, { type:'array' });
        const parsed = parseImportFile(wb);
        if (!parsed.length) throw new Error('No questions found. Check your file matches the template format.');
        setImportPreview(parsed);
        setTab(3); // switch to import tab
        showSnack(`Found ${parsed.length} module(s) with ${parsed.reduce((s,m)=>s+m.questions.length,0)} questions`, 'info');
      } catch(err) {
        setImportErr(err.message);
        setTab(3);
      }
    };
    reader.readAsArrayBuffer(f);
    e.target.value='';
  }

  function applyImport() {
    if (!importPreview) return;
    if (importMode === 'replace') {
      setDraft(importPreview);
      setSelModIdx(0); setSelQIdx(null);
    } else {
      // Append — merge modules with same title, add new ones
      const merged = [...draft];
      for (const newMod of importPreview) {
        const existing = merged.findIndex(m => m.title.toLowerCase() === newMod.title.toLowerCase());
        if (existing >= 0) {
          merged[existing] = { ...merged[existing], questions: [...merged[existing].questions, ...newMod.questions] };
        } else {
          merged.push(newMod);
        }
      }
      setDraft(merged);
    }
    setImportPreview(null);
    setTab(0);
    showSnack('Import applied to draft — click Save to go live', 'success');
  }

  const selQ=selMod&&selQIdx!==null?selMod.questions[selQIdx]:null;
  const isDirty=JSON.stringify(draft.map(({icon,...m})=>m))!==JSON.stringify(modules.map(m=>({...m,iconName:Object.entries(ICON_MAP).find(([,v])=>v===m.icon)?.[0]||'PhishingIcon',icon:undefined})));

  return (
    <Box sx={{pb:10}}>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',mb:3,flexWrap:'wrap',gap:2}}>
        <Box>
          <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:1}}>Dashboard</Button>
          <Typography variant="h4" sx={{display:'flex',alignItems:'center',gap:1}}><EditIcon/>Question Bank Manager</Typography>
          <Typography color="text.secondary">Edit modules and questions, import XLSX/CSV, export, or reset to the built-in bank.</Typography>
        </Box>
        <Box sx={{display:'flex',gap:1,flexWrap:'wrap',alignItems:'center'}}>
          {isDirty&&<Chip label="Unsaved changes" color="warning" size="small"/>}
          {/* Import */}
          <Button variant="outlined" color="success" component="label" startIcon={<UploadIcon/>} size="small">
            Import XLSX/CSV
            <input type="file" accept=".xlsx,.xls,.csv,.ods" hidden onChange={handleImportFile}/>
          </Button>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon/>} onClick={()=>downloadTemplate()} color="success">
            Download template
          </Button>
          {/* Export */}
          <Button variant="outlined" startIcon={<DownloadIcon/>} onClick={()=>exportToXlsx(draft)} size="small">Export XLSX</Button>
          <Button variant="outlined" startIcon={<DownloadIcon/>} onClick={downloadJson} size="small">Export JSON</Button>
          <Button variant="outlined" component="label" startIcon={<UploadIcon/>} size="small">
            Import JSON<input type="file" accept=".json" hidden onChange={handleJsonFile}/>
          </Button>
          <Button variant="outlined" color="warning" startIcon={<RestoreIcon/>} onClick={()=>setConfirmReset(true)} size="small">Reset to default</Button>
          <Button variant="contained" startIcon={<SaveIcon/>} onClick={saveAll} disabled={!isDirty}>Save changes</Button>
        </Box>
      </Box>
      <Alert severity="info" sx={{mb:3}}>
        Import questions from <strong>XLSX, XLS, CSV or ODS</strong> using the template format. Download the template for instructions and an example.
        Changes take effect when you click Save.
      </Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper elevation={1} sx={{p:2}}>
            <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1.5}}>
              <Typography variant="subtitle1" fontWeight={700}>Modules ({draft.length})</Typography>
              <Tooltip title="Add module"><IconButton size="small" color="primary" onClick={addModule}><AddIcon/></IconButton></Tooltip>
            </Box>
            <List disablePadding>
              {draft.map((m,i)=>{
                const Icon=resolveIcon(m.iconName); const col=getCol(m.id);
                return (<React.Fragment key={m.id||i}>{i>0&&<Divider/>}
                  <ListItem dense button selected={selModIdx===i} onClick={()=>{setSelModIdx(i);setSelQIdx(null);setTab(0);}}
                    secondaryAction={<Tooltip title="Delete"><IconButton edge="end" size="small" color="error" onClick={e=>{e.stopPropagation();deleteModule(i);}}><DeleteIcon fontSize="small"/></IconButton></Tooltip>}
                    sx={{'&.Mui-selected':{bgcolor:'primary.50',borderLeft:'3px solid',borderColor:'primary.main'}}}>
                    <ListItemIcon sx={{minWidth:32}}><Icon sx={{color:col.main,fontSize:18}}/></ListItemIcon>
                    <ListItemText primary={<Typography variant="body2" fontWeight={selModIdx===i?700:400} noWrap>{m.title||'Untitled'}</Typography>} secondary={`${m.questions?.length||0} questions`}/>
                  </ListItem>
                </React.Fragment>);
              })}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {selMod?(
            <Paper elevation={1}>
              <Box sx={{borderBottom:'1px solid',borderColor:'divider'}}>
                <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',px:2,pt:1}}>
                  <Box sx={{display:'flex',gap:.5}}>
                    {['Module details',`Questions (${selMod.questions?.length||0})`,'JSON editor','Import preview'].map((label,i)=>(
                      <Button key={label} onClick={()=>{if(i===2)openJson();else setTab(i);}} variant={tab===i?'contained':'text'} size="small" sx={{mr:.5,mb:1}}>
                        {label}{i===3&&importPreview&&<Chip label={importPreview.reduce((s,m)=>s+m.questions.length,0)} color="success" size="small" sx={{ml:.5,height:16,fontSize:10}}/>}
                      </Button>
                    ))}
                  </Box>
                  {tab===1&&<Button size="small" variant="outlined" startIcon={<AddIcon/>} onClick={addQuestion} sx={{mb:1}}>Add question</Button>}
                </Box>
              </Box>
              <Box sx={{p:3}}>
                {tab===0&&(
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Module title" value={selMod.title} onChange={e=>updateMod('title',e.target.value)}/></Grid>
                    <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="ID (unique)" value={selMod.id} onChange={e=>updateMod('id',e.target.value.toLowerCase().replace(/\s+/g,'_'))}/></Grid>
                    <Grid item xs={12} sm={3}><TextField select fullWidth size="small" label="Icon" value={selMod.iconName||'PhishingIcon'} onChange={e=>updateMod('iconName',e.target.value)}>{ICON_NAMES.map(n=><MenuItem key={n} value={n}>{n.replace('Icon','')}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12}><TextField fullWidth size="small" label="Summary" value={selMod.summary} onChange={e=>updateMod('summary',e.target.value)} multiline rows={2}/></Grid>
                    <Grid item xs={12}>
                      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:1}}><Typography variant="subtitle2">Learning points</Typography><Button size="small" startIcon={<AddIcon/>} onClick={addLesson}>Add</Button></Box>
                      {(selMod.lessons||[]).map((l,i)=>(
                        <Box key={i} sx={{display:'flex',gap:1,mb:1,alignItems:'flex-start'}}>
                          <Typography variant="caption" sx={{pt:1.2,minWidth:20,color:'text.secondary'}}>{i+1}.</Typography>
                          <TextField fullWidth size="small" value={l} onChange={e=>updateLesson(i,e.target.value)} multiline placeholder="Learning point…"/>
                          <IconButton size="small" color="error" onClick={()=>removeLesson(i)} disabled={(selMod.lessons||[]).length<=1}><DeleteIcon fontSize="small"/></IconButton>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                )}
                {tab===1&&(
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <List dense disablePadding sx={{maxHeight:600,overflow:'auto'}}>
                        {(selMod.questions||[]).map((q,qi)=>(
                          <React.Fragment key={qi}>{qi>0&&<Divider/>}
                            <ListItem dense button selected={selQIdx===qi} onClick={()=>setSelQIdx(qi)}
                              secondaryAction={<Box sx={{display:'flex'}}>
                                <Tooltip title="Duplicate"><IconButton edge="end" size="small" onClick={e=>{e.stopPropagation();dupQuestion(qi);}}><CopyIcon fontSize="small"/></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton edge="end" size="small" color="error" onClick={e=>{e.stopPropagation();deleteQuestion(qi);}}><DeleteIcon fontSize="small"/></IconButton></Tooltip>
                              </Box>}
                              sx={{'&.Mui-selected':{bgcolor:'primary.50',borderLeft:'3px solid',borderColor:'primary.main'}}}>
                              <ListItemIcon sx={{minWidth:28}}><Typography variant="caption" fontWeight={700} sx={{color:'text.secondary'}}>{qi+1}</Typography></ListItemIcon>
                              <ListItemText primary={<Typography variant="body2" noWrap sx={{fontWeight:selQIdx===qi?700:400}}>{q.q||'(no text)'}</Typography>} secondary={<Chip label={q.type==='multi'?'multi':'single'} size="small" sx={{height:16,fontSize:10,mt:.25}}/>}/>
                            </ListItem>
                          </React.Fragment>
                        ))}
                        {(!selMod.questions||selMod.questions.length===0)&&<Box sx={{p:2,textAlign:'center'}}><Typography variant="body2" color="text.secondary">No questions yet</Typography><Button size="small" startIcon={<AddIcon/>} onClick={addQuestion} sx={{mt:1}}>Add first question</Button></Box>}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      {selQ?(
                        <Box>
                          <Box sx={{display:'flex',gap:1,mb:2,alignItems:'center'}}>
                            <Typography variant="subtitle2" sx={{flex:1}}>Question {selQIdx+1}</Typography>
                            <Button size="small" variant={selQ.type==='single'?'contained':'outlined'} onClick={()=>setQType(selQIdx,'single')}>Single answer</Button>
                            <Button size="small" variant={selQ.type==='multi'?'contained':'outlined'} onClick={()=>setQType(selQIdx,'multi')}>Multi-select</Button>
                          </Box>
                          <TextField fullWidth size="small" label="Question text" value={selQ.q} onChange={e=>updateQ(selQIdx,'q',e.target.value)} multiline rows={2} sx={{mb:2}}/>
                          <Typography variant="subtitle2" sx={{mb:1}}>Options — {selQ.type==='multi'?'tick all correct answers':'select the correct answer'}</Typography>
                          {(selQ.options||[]).map((opt,oi)=>{
                            const isCorrectOpt=selQ.type==='multi'?(Array.isArray(selQ.answer)&&selQ.answer.includes(oi)):selQ.answer===oi;
                            return (
                              <Box key={oi} sx={{display:'flex',gap:1,mb:1,alignItems:'center'}}>
                                {selQ.type==='multi'
                                  ?<Tooltip title="Toggle correct"><IconButton size="small" color={isCorrectOpt?'success':'default'} onClick={()=>toggleMultiAns(selQIdx,oi)}>{isCorrectOpt?<CheckBoxIcon/>:<CheckBoxOutlineBlank/>}</IconButton></Tooltip>
                                  :<Tooltip title="Mark as correct"><IconButton size="small" color={isCorrectOpt?'success':'default'} onClick={()=>updateQ(selQIdx,'answer',oi)}>{isCorrectOpt?<CheckCircle/>:<RadioButtonUnchecked/>}</IconButton></Tooltip>}
                                <TextField size="small" fullWidth placeholder={`Option ${oi+1}`} value={opt} onChange={e=>updateOpt(selQIdx,oi,e.target.value)}/>
                                <IconButton size="small" color="error" onClick={()=>removeOpt(selQIdx,oi)} disabled={(selQ.options||[]).length<=2}><DeleteIcon fontSize="small"/></IconButton>
                              </Box>
                            );
                          })}
                          <Button size="small" startIcon={<AddIcon/>} onClick={()=>addOpt(selQIdx)} disabled={(selQ.options||[]).length>=6} sx={{mb:2}}>Add option</Button>
                          <TextField fullWidth size="small" label="Explainer (shown after answer is revealed)" value={selQ.explainer} onChange={e=>updateQ(selQIdx,'explainer',e.target.value)} multiline rows={3}/>
                        </Box>
                      ):(
                        <Box sx={{textAlign:'center',py:6}}><QIcon sx={{fontSize:48,color:'text.disabled',mb:1}}/><Typography color="text.secondary">Select a question to edit, or add a new one.</Typography></Box>
                      )}
                    </Grid>
                  </Grid>
                )}
                {tab===2&&(
                  <Box>
                    <Alert severity="info" sx={{mb:2}}>Paste a complete JSON question bank here. Each module needs <code>id</code>, <code>title</code>, <code>summary</code>, <code>lessons</code>, and <code>questions</code>. Each question needs <code>type</code>, <code>q</code>, <code>options</code>, <code>answer</code>, and <code>explainer</code>.</Alert>
                    {jsonErr&&<Alert severity="error" sx={{mb:2}}>{jsonErr}</Alert>}
                    <TextField fullWidth multiline rows={20} value={jsonText} onChange={e=>setJsonText(e.target.value)} inputProps={{style:{fontFamily:'monospace',fontSize:12}}} variant="outlined"/>
                    <Box sx={{display:'flex',gap:1,mt:2,flexWrap:'wrap'}}>
                      <Button variant="contained" onClick={applyJson}>Apply JSON to draft</Button>
                      <Button variant="outlined" startIcon={<DownloadIcon/>} onClick={downloadJson}>Download as file</Button>
                      <Button variant="outlined" component="label" startIcon={<UploadIcon/>}>Upload JSON file<input type="file" accept=".json" hidden onChange={handleJsonFile}/></Button>
                    </Box>
                  </Box>
                )}

                {/* ── Tab 3: Import preview ── */}
                {tab===3&&(
                  <Box>
                    {importErr&&<Alert severity="error" sx={{mb:2}}>{importErr}</Alert>}
                    {!importPreview&&!importErr&&(
                      <Box sx={{textAlign:'center',py:6}}>
                        <UploadIcon sx={{fontSize:56,color:'text.disabled',mb:2}}/>
                        <Typography variant="h6" gutterBottom>No file imported yet</Typography>
                        <Typography color="text.secondary" sx={{mb:3}}>Use the "Import XLSX/CSV" button above to load a question file.</Typography>
                        <Button variant="outlined" color="success" startIcon={<DownloadIcon/>} onClick={()=>downloadTemplate()}>
                          Download template
                        </Button>
                      </Box>
                    )}
                    {importPreview&&(
                      <Box>
                        <Alert severity="success" sx={{mb:2}}>
                          <strong>Import ready:</strong> {importPreview.length} module{importPreview.length!==1?'s':''} · {importPreview.reduce((s,m)=>s+m.questions.length,0)} questions total
                        </Alert>

                        {/* Replace or append */}
                        <Box sx={{display:'flex',gap:1.5,mb:3}}>
                          {[
                            {val:'replace',label:'Replace all modules',desc:'Remove existing modules and replace with imported ones.'},
                            {val:'append', label:'Append to existing', desc:'Add imported modules/questions alongside the current bank.'},
                          ].map(opt=>(
                            <Paper key={opt.val} variant="outlined" onClick={()=>setImportMode(opt.val)}
                              sx={{flex:1,p:2,cursor:'pointer',border:'2px solid',
                                borderColor:importMode===opt.val?'success.main':'divider',
                                bgcolor:importMode===opt.val?'rgba(76,175,80,0.08)':'background.paper',
                                transition:'all .15s'}}>
                              <Box sx={{display:'flex',alignItems:'center',gap:1,mb:.5}}>
                                {importMode===opt.val?<CheckCircle sx={{color:'success.main',fontSize:18}}/>:<RadioButtonUnchecked sx={{color:'text.disabled',fontSize:18}}/>}
                                <Typography variant="subtitle2" fontWeight={700}>{opt.label}</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                            </Paper>
                          ))}
                        </Box>

                        {/* Preview table */}
                        {importPreview.map((m,mi)=>(
                          <Paper key={mi} variant="outlined" sx={{mb:2,overflow:'hidden'}}>
                            <Box sx={{p:2,bgcolor:'rgba(76,175,80,0.06)',borderBottom:'1px solid',borderColor:'divider',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700}>{m.title}</Typography>
                                <Typography variant="caption" color="text.secondary">{m.questions.length} question{m.questions.length!==1?'s':''}</Typography>
                              </Box>
                              <Chip label={`${m.questions.filter(q=>q.type==='multi').length} multi · ${m.questions.filter(q=>q.type==='single').length} single`} size="small" variant="outlined"/>
                            </Box>
                            <TableContainer sx={{maxHeight:220}}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{width:40}}>#</TableCell>
                                    <TableCell sx={{width:60}}>Type</TableCell>
                                    <TableCell>Question</TableCell>
                                    <TableCell sx={{width:120}}>Correct answer(s)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {m.questions.map((q,qi)=>{
                                    const correct = q.type==='multi'
                                      ? (Array.isArray(q.answer)?q.answer:[q.answer]).map(i=>q.options[i]).join(', ')
                                      : q.options[q.answer];
                                    return (
                                      <TableRow key={qi}>
                                        <TableCell>{qi+1}</TableCell>
                                        <TableCell><Chip label={q.type==='multi'?'MA':'SA'} size="small" color={q.type==='multi'?'info':'default'} sx={{fontSize:10,height:18}}/></TableCell>
                                        <TableCell><Typography variant="body2" sx={{fontSize:12}}>{q.q}</Typography></TableCell>
                                        <TableCell><Typography variant="caption" color="success.main">{correct}</Typography></TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Paper>
                        ))}

                        <Box sx={{display:'flex',gap:1.5,mt:2}}>
                          <Button variant="contained" color="success" startIcon={<CheckCircle/>} onClick={applyImport} size="large">
                            Apply import to draft
                          </Button>
                          <Button variant="outlined" onClick={()=>{setImportPreview(null);setImportErr('');}}>
                            Discard import
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          ):(
            <Box sx={{textAlign:'center',py:8}}><EditIcon sx={{fontSize:64,color:'text.disabled',mb:2}}/><Typography color="text.secondary">Select a module on the left.</Typography></Box>
          )}
        </Grid>
      </Grid>
      {isDirty&&(
        <Paper elevation={8} sx={{position:'fixed',bottom:0,left:0,right:0,p:2,display:'flex',justifyContent:'center',gap:2,bgcolor:'warning.main',color:'white',zIndex:1300}}>
          <Typography variant="body2" sx={{alignSelf:'center'}}>⚠ You have unsaved changes</Typography>
          <Button variant="contained" sx={{bgcolor:'white',color:'warning.dark','&:hover':{bgcolor:'grey.100'}}} startIcon={<SaveIcon/>} onClick={saveAll}>Save question bank</Button>
          <Button variant="outlined" sx={{borderColor:'rgba(255,255,255,.6)',color:'white'}} onClick={()=>{setDraft(modules.map(m=>({...m,iconName:Object.entries(ICON_MAP).find(([,v])=>v===m.icon)?.[0]||'PhishingIcon'})));showSnack('Draft reverted','info');}}>Discard</Button>
        </Paper>
      )}
      <ConfirmDialog open={confirmReset} title="Reset to built-in question bank?" body="This will replace your current draft with the original NCSC question bank. Any unsaved edits will be lost." onConfirm={resetToDefault} onCancel={()=>setConfirmReset(false)} busy={false} confirmLabel="Yes, reset draft" confirmColor="warning"/>
    </Box>
  );
}

// ─── CERTIFICATES VIEW ────────────────────────────────────────────────────────
function CertsView({ certs, attempts, modules, passMark, user, settings, onBack }) {
  function printCert(cert) {
    const w = window.open('','_blank');
    const mod = modules.find(m=>m.id===cert.moduleId)||{title:cert.moduleTitle||cert.moduleId};
    const col = getCol(cert.moduleId);
    w.document.write(`<!DOCTYPE html><html><head><title>Certificate — ${mod.title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:Roboto,sans-serif; background:#f5f5f5; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
      .cert { background:white; width:800px; padding:60px; border-radius:8px; box-shadow:0 4px 32px rgba(0,0,0,.15); text-align:center; border-top:8px solid ${col.main}; }
      .logo { font-size:14px; font-weight:700; color:#666; letter-spacing:3px; text-transform:uppercase; margin-bottom:40px; }
      .logo span { color:${BRAND_RED}; }
      .title { font-size:13px; color:#999; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px; }
      .name { font-size:40px; font-weight:300; color:#1D1D1B; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:24px; margin-bottom:24px; }
      .body { font-size:16px; color:#555; margin-bottom:8px; line-height:1.6; }
      .module { font-size:24px; font-weight:700; color:${col.main}; margin:16px 0; }
      .score { font-size:48px; font-weight:700; color:${col.main}; }
      .score-label { font-size:13px; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:32px; }
      .meta { font-size:12px; color:#bbb; margin-top:40px; border-top:1px solid #eee; padding-top:20px; }
      @media print { body { background:white; } .cert { box-shadow:none; } }
    </style></head><body>
    <div class="cert">
      <div class="logo">Your Cybersecurity @ <span>Comp X</span></div>
      <div class="title">Certificate of Completion</div>
      <div class="name">${cert.userName||user?.displayName||user?.username||'User'}</div>
      <div class="body">has successfully completed</div>
      <div class="module">${mod.title}</div>
      <div class="body">with a score of</div>
      <div class="score">${cert.pct}%</div>
      <div class="score-label">Pass mark: ${passMark}%</div>
      <div class="body">Issued by ${settings?.orgName||cert.orgName||'Comp X'}</div>
      <div class="meta">Issued: ${new Date(cert.issuedAt).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})} &nbsp;·&nbsp; Certificate ID: ${cert.id} &nbsp;·&nbsp; ncsc.gov.uk</div>
    </div>
    <script>window.onload=()=>window.print();</script>
    </body></html>`);
    w.document.close();
  }

  const certModules = modules.filter(m => certs.some(c=>c.moduleId===m.id));
  const uncertModules = modules.filter(m => !certs.some(c=>c.moduleId===m.id));

  return (
    <Box>
      <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:3}}>Dashboard</Button>
      <Typography variant="h4" gutterBottom sx={{display:'flex',alignItems:'center',gap:1}}><CertIcon/> My Certificates</Typography>
      <Typography color="text.secondary" sx={{mb:4}}>Certificates are awarded when you pass a module above the {passMark}% pass mark. Your best score is used.</Typography>

      {certs.length === 0 ? (
        <Paper elevation={1} sx={{p:6,textAlign:'center'}}>
          <CertIcon sx={{fontSize:64,color:'text.disabled',mb:2}}/>
          <Typography variant="h6" gutterBottom>No certificates yet</Typography>
          <Typography color="text.secondary">Complete a module with a score of {passMark}% or above to earn your first certificate.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{mb:4}}>
          {certs.map(cert => {
            const mod = modules.find(m=>m.id===cert.moduleId)||{title:cert.moduleTitle||cert.moduleId,icon:SecurityIcon};
            const col = getCol(cert.moduleId);
            const Icon = mod.icon;
            const modAttempts = attempts.filter(a=>a.moduleId===cert.moduleId);
            const attemptCount = modAttempts.length;
            return (
              <Grid item xs={12} sm={6} key={cert.id}>
                <Paper elevation={2} sx={{p:3,borderTop:`4px solid ${col.main}`,borderRadius:2}}>
                  <Box sx={{display:'flex',alignItems:'flex-start',gap:2,mb:2}}>
                    <Box sx={{width:52,height:52,borderRadius:2,bgcolor:col.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon sx={{color:col.main,fontSize:28}}/>
                    </Box>
                    <Box sx={{flex:1}}>
                      <Typography variant="h6" fontWeight={700}>{mod.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}
                      </Typography>
                    </Box>
                    <Box sx={{textAlign:'right'}}>
                      <Typography variant="h4" fontWeight={700} sx={{color:col.main}}>{cert.pct}%</Typography>
                      <Chip label="PASSED" color="success" size="small"/>
                    </Box>
                  </Box>
                  <Divider sx={{mb:2}}/>
                  <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:2}}>
                    <Typography variant="caption" color="text.secondary">{attemptCount} attempt{attemptCount!==1?'s':''} total · Certificate ID: {cert.id.slice(-8)}</Typography>
                  </Box>
                  <Button variant="contained" startIcon={<ExportIcon/>} onClick={()=>printCert(cert)} sx={{bgcolor:col.main,'&:hover':{bgcolor:col.dark}}}>
                    Download / Print
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {uncertModules.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{mb:2,color:'text.secondary'}}>Modules not yet completed</Typography>
          <Grid container spacing={2}>
            {uncertModules.map(m => {
              const col = getCol(m.id); const Icon = m.icon;
              const best = attempts.filter(a=>a.moduleId===m.id).reduce((max,a)=>Math.max(max,a.pct),0);
              return (
                <Grid item xs={12} sm={6} key={m.id}>
                  <Paper variant="outlined" sx={{p:2,display:'flex',alignItems:'center',gap:2,opacity:.7}}>
                    <Box sx={{width:40,height:40,borderRadius:1.5,bgcolor:col.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon sx={{color:col.main,fontSize:22}}/></Box>
                    <Box sx={{flex:1}}><Typography variant="subtitle2">{m.title}</Typography><Typography variant="caption" color="text.secondary">{best?`Best score: ${best}% — need ${passMark}% to pass`:'Not yet attempted'}</Typography></Box>
                    <LinearProgress variant="determinate" value={Math.min(best,100)} sx={{width:60,height:6,borderRadius:3,'& .MuiLinearProgress-bar':{bgcolor:best>=passMark?'success.main':col.main}}}/>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

// Placeholder for BRAND_RED in cert template (used as string in HTML)
const BRAND_RED = BRAND.red;

// ─── COMPLETION REPORT VIEW (admin) ──────────────────────────────────────────
function ReportView({ user, showSnack, onBack, modules, passMark }) {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState(0);

  useEffect(()=>{
    if(user?.role!=='admin'){setLoading(false);return;}
    try {
      const result = api.adminGetReport(modules.map(m=>m.id), passMark);
      Promise.resolve(result).then(r=>{setReport(Array.isArray(r)?r:[]);setLoading(false);}).catch(()=>setLoading(false));
    } catch(e) { setLoading(false); }
  },[]);

  function exportCsv() {
    if(!report)return;
    const rows=[['Username','Display Name','Module','Attempts','Best Score','Latest Score','Passed','Certified','Cert Date','Time Spent (s)','Last Attempt']];
    report.forEach(r=>{
      r.modules.forEach(m=>{
        const mod=modules.find(x=>x.id===m.moduleId)||{title:m.moduleId};
        rows.push([r.user.username,r.user.displayName||r.user.username,mod.title,m.attempts,m.best??'',m.latestPct??'',m.passed?'Yes':'No',m.certified?'Yes':'No',m.certDate?new Date(m.certDate).toLocaleDateString('en-GB'):'',m.duration??'',m.latestTs?new Date(m.latestTs).toLocaleDateString('en-GB'):'']);
      });
    });
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download=`CompX-Cyber-Report-${new Date().toISOString().slice(0,10)}.csv`;a.click();
    showSnack('Report exported as CSV');
  }

  if(user?.role!=='admin') return <Alert severity="error">Admin access required.</Alert>;
  if(loading) return <Box sx={{textAlign:'center',py:8}}><CircularProgress/></Box>;
  if(!report||!report.length) return <Box sx={{textAlign:'center',py:8}}><Typography color="text.secondary">No data yet.</Typography></Box>;

  // Summary stats
  const totalUsers = report.length;
  const fullyCompleted = report.filter(r=>r.allPassed).length;
  const totalAttempts = report.reduce((s,r)=>s+r.totalAttempts,0);
  const avgScore = (() => {
    const all = report.flatMap(r=>r.modules.map(m=>m.latestPct)).filter(v=>v!=null);
    return all.length ? Math.round(all.reduce((s,v)=>s+v,0)/all.length) : 0;
  })();

  return (
    <Box>
      <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',mb:3,flexWrap:'wrap',gap:2}}>
        <Box><Button startIcon={<ArrowBack/>} onClick={onBack} sx={{mb:1}}>Dashboard</Button><Typography variant="h4" sx={{display:'flex',alignItems:'center',gap:1}}><ReportIcon2/>Completion Report</Typography></Box>
        <Button variant="contained" startIcon={<ExportIcon/>} onClick={exportCsv}>Export CSV</Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{mb:4}}>
        {[
          {label:'Total users',value:totalUsers,icon:<PersonIcon/>},
          {label:'Fully completed',value:`${fullyCompleted} / ${totalUsers}`,icon:<CertIcon/>},
          {label:'Total attempts',value:totalAttempts,icon:<FlameIcon/>},
          {label:'Average score',value:`${avgScore}%`,icon:<TrophyIcon/>},
        ].map(s=>(
          <Grid item xs={6} md={3} key={s.label}>
            <Paper elevation={1} sx={{p:2,display:'flex',alignItems:'center',gap:2}}>
              <Box sx={{color:'primary.main'}}>{s.icon}</Box>
              <Box><Typography variant="caption" color="text.secondary" sx={{display:'block',textTransform:'uppercase',letterSpacing:.8}}>{s.label}</Typography><Typography variant="h5" fontWeight={700}>{s.value}</Typography></Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Per-module completion bars */}
      <Paper elevation={1} sx={{p:3,mb:3}}>
        <Typography variant="h6" sx={{mb:2}}>Module completion rates</Typography>
        {modules.map(m=>{
          const col=getCol(m.id);
          const passedCount=report.filter(r=>r.modules.find(x=>x.moduleId===m.id)?.passed).length;
          const pct=totalUsers?Math.round(passedCount/totalUsers*100):0;
          const certCount=report.filter(r=>r.modules.find(x=>x.moduleId===m.id)?.certified).length;
          return (
            <Box key={m.id} sx={{mb:2}}>
              <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:.5}}>
                <Typography variant="body2" fontWeight={600}>{m.title}</Typography>
                <Box sx={{display:'flex',gap:1,alignItems:'center'}}>
                  <Chip label={`${passedCount}/${totalUsers} passed`} size="small" color={pct>=80?'success':pct>=50?'warning':'error'}/>
                  <Chip label={`${certCount} certs`} size="small" variant="outlined" color="warning"/>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={pct} sx={{height:8,borderRadius:4,'& .MuiLinearProgress-bar':{bgcolor:col.main}}}/>
            </Box>
          );
        })}
      </Paper>

      {/* User-level table */}
      <Paper elevation={1}>
        <Box sx={{p:2,borderBottom:'1px solid',borderColor:'divider'}}>
          <Typography variant="h6">User breakdown</Typography>
        </Box>
        <TableContainer sx={{maxHeight:500}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                {modules.map(m=><TableCell key={m.id} align="center">{m.title.split(' ').slice(-1)[0]}</TableCell>)}
                <TableCell align="center">All done</TableCell>
                <TableCell align="center">Attempts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.map(r=>(
                <TableRow key={r.user.id}>
                  <TableCell>
                    <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                      <Avatar sx={{width:24,height:24,fontSize:11,bgcolor:r.user.role==='admin'?BRAND.red:'grey.600'}}>{r.user.username?.[0]?.toUpperCase()}</Avatar>
                      <Box><Typography variant="body2" fontWeight={600}>{r.user.displayName||r.user.username}</Typography><Typography variant="caption" color="text.secondary">{r.user.username}</Typography></Box>
                    </Box>
                  </TableCell>
                  {r.modules.map(m=>{
                    const col=getCol(m.moduleId);
                    return (
                      <TableCell key={m.moduleId} align="center">
                        {m.attempts===0 ? <Typography variant="caption" color="text.disabled">—</Typography>
                          : <Box sx={{display:'flex',flexDirection:'column',alignItems:'center',gap:.25}}>
                              <Chip label={`${m.latestPct??'—'}%`} size="small" color={m.passed?'success':m.latestPct>=passMark*0.7?'warning':'error'} sx={{minWidth:50}}/>
                              {m.certified&&<CertIcon sx={{fontSize:14,color:'warning.main'}}/>}
                            </Box>
                        }
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    {r.allPassed ? <CheckCircle sx={{color:'success.main',fontSize:20}}/> : <Cancel sx={{color:'text.disabled',fontSize:20}}/>}
                  </TableCell>
                  <TableCell align="center"><Typography variant="body2">{r.totalAttempts}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

// ─── PENDING APPROVAL VIEW ────────────────────────────────────────────────────
function PendingView({ onBack }) {
  return (
    <Box sx={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:`linear-gradient(135deg, #141413 0%, #1D1D1B 50%, #251010 100%)`, p:2,
    }}>
      <Paper elevation={0} sx={{width:'100%', maxWidth:460, borderRadius:3, overflow:'hidden', border:`1px solid ${BRAND.border}`}}>
        <Box sx={{bgcolor:BRAND.black, px:4, py:3, color:'white', textAlign:'center', borderBottom:`3px solid ${BRAND.red}`}}>
          <SecurityIcon sx={{fontSize:48, mb:1, color:BRAND.red}}/>
          <Typography variant="h5" fontWeight={700} color="white">CyberCBT</Typography>
        </Box>
        <Box sx={{px:4, py:4, textAlign:'center'}}>
          <Box sx={{width:72, height:72, borderRadius:'50%', bgcolor:'rgba(240,165,0,0.12)', display:'flex', alignItems:'center', justifyContent:'center', mx:'auto', mb:3}}>
            <PersonIcon sx={{fontSize:40, color:'warning.main'}}/>
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>Registration submitted</Typography>
          <Typography color="text.secondary" sx={{mb:3}}>
            Your account is awaiting approval from an administrator. You will be able to sign in once approved.
          </Typography>
          <Alert severity="info" sx={{mb:3, textAlign:'left'}}>
            <AlertTitle>What happens next?</AlertTitle>
            An admin will review your registration and either approve or decline it.
            Once approved, return to this page and sign in with your credentials.
          </Alert>
          <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack/>}>
            Back to sign in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

// ─── NOTIFICATION DRAWER ──────────────────────────────────────────────────────
const NOTIF_ICONS = {
  approval: PersonAddIcon,
  deadline: DeadlineIcon,
  info:     SchoolIcon,
};
const NOTIF_COLORS = {
  error:   '#FF5252',
  warning: '#F0A500',
  info:    '#29B6F6',
};

function NotificationDrawer({ open, onClose, notifications, onAction }) {
  function timeAgo(ts) {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 400 }, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' } }}>

      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: BRAND.black, borderBottom: `3px solid ${BRAND.red}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsIcon sx={{ color: BRAND.red }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="white">Notifications</Typography>
            <Typography variant="caption" sx={{ color: BRAND.textSec }}>
              {notifications.length === 0 ? 'All clear' : `${notifications.length} active`}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
          <Cancel />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircle sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>All clear!</Typography>
            <Typography variant="body2" color="text.secondary">No pending notifications. Keep up the great work.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((n, i) => {
              const Icon = NOTIF_ICONS[n.type] || NotificationsIcon;
              const color = NOTIF_COLORS[n.severity] || NOTIF_COLORS.info;
              const hasAction = !!n.action;
              return (
                <React.Fragment key={n.id}>
                  {i > 0 && <Divider sx={{ my: 1 }} />}
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: 2, borderRadius: 2,
                      borderLeft: `4px solid ${color}`,
                      borderColor: `${color} !important`,
                      cursor: hasAction ? 'pointer' : 'default',
                      transition: 'background .15s',
                      '&:hover': hasAction ? { bgcolor: 'rgba(255,255,255,0.04)' } : {},
                    }}
                    onClick={hasAction ? () => onAction(n) : undefined}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        bgcolor: `${color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon sx={{ fontSize: 20, color }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.25 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color }}>{n.title}</Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>{timeAgo(n.ts)}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: hasAction ? 1 : 0 }}>{n.body}</Typography>
                        {hasAction && (
                          <Button size="small" variant="outlined" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                            sx={{ borderColor: color, color, '&:hover': { borderColor: color, bgcolor: `${color}12` }, fontSize: 11, py: 0.25 }}>
                            {n.action === 'admin'     ? 'Go to Admin Panel' :
                             n.action === 'learn'     ? 'Open Module' :
                             n.action === 'dashboard' ? 'Go to Dashboard' : 'View'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="caption" color="text.disabled">Notifications refresh every 30 seconds. Click any item to take action.</Typography>
      </Box>
    </Drawer>
  );
}

// ─── PROOF-OF-WORK CAPTCHA ────────────────────────────────────────────────────
// Self-hosted PoW (ALTCHA-style). No external service, no cookies, no tracking.
// Works on file://, HTTP and HTTPS via pure-JS SHA-256 fallback.

function sha256pure(str) {
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const msg=new TextEncoder().encode(str);const len=msg.length;
  const totalBytes=Math.ceil((len+9)/64)*64;
  const buf=new Uint8Array(totalBytes);buf.set(msg);buf[len]=0x80;
  const dv=new DataView(buf.buffer);dv.setUint32(totalBytes-4,len*8,false);
  const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const r=(n,b)=>(n>>>b)|(n<<(32-b));
  const wd=new DataView(buf.buffer);
  for(let i=0;i<totalBytes;i+=64){
    const w=[];
    for(let j=0;j<16;j++)w[j]=wd.getUint32(i+j*4,false);
    for(let j=16;j<64;j++){const s0=r(w[j-15],7)^r(w[j-15],18)^(w[j-15]>>>3);const s1=r(w[j-2],17)^r(w[j-2],19)^(w[j-2]>>>10);w[j]=(w[j-16]+s0+w[j-7]+s1)>>>0;}
    let[a,b,c,d,e,f,g,hh]=[...h];
    for(let j=0;j<64;j++){const S1=(r(e,6)^r(e,11)^r(e,25))>>>0;const ch=((e&f)^(~e&g))>>>0;const t1=(hh+S1+ch+K[j]+w[j])>>>0;const S0=(r(a,2)^r(a,13)^r(a,22))>>>0;const maj=((a&b)^(a&c)^(b&c))>>>0;const t2=(S0+maj)>>>0;hh=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
    h[0]=(h[0]+a)>>>0;h[1]=(h[1]+b)>>>0;h[2]=(h[2]+c)>>>0;h[3]=(h[3]+d)>>>0;
    h[4]=(h[4]+e)>>>0;h[5]=(h[5]+f)>>>0;h[6]=(h[6]+g)>>>0;h[7]=(h[7]+hh)>>>0;
  }
  return h.map(n=>n.toString(16).padStart(8,'0')).join('');
}

async function sha256hex(str) {
  if (typeof crypto!=='undefined' && crypto.subtle) {
    try {
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    } catch {}
  }
  return sha256pure(str);
}

async function solvePoW(challenge, difficulty) {
  const target='0'.repeat(Math.floor(difficulty/4));
  for(let nonce=0;nonce<5_000_000;nonce++){
    const hash=await sha256hex(`${challenge}:${nonce}`);
    if(hash.startsWith(target)) return JSON.stringify({challenge,nonce,hash});
    if(nonce%500===0) await new Promise(r=>setTimeout(r,0));
  }
  throw new Error('PoW failed');
}

function PoWStatus({solving, solved, errMsg}) {
  if(!solving&&!solved&&!errMsg) return null;
  return (
    <Box sx={{display:'flex',alignItems:'center',gap:1.5,p:1.5,borderRadius:1,border:'1px solid',mt:1,
      borderColor:errMsg?'error.main':solved?'success.main':'divider',
      bgcolor:errMsg?'rgba(255,82,82,0.06)':solved?'rgba(76,175,80,0.06)':'background.paper'}}>
      {solving&&<CircularProgress size={16} thickness={5} sx={{flexShrink:0}}/>}
      {solved&&<CheckCircle sx={{color:'success.main',fontSize:18,flexShrink:0}}/>}
      {errMsg&&<Cancel sx={{color:'error.main',fontSize:18,flexShrink:0}}/>}
      <Box>
        <Typography variant="caption" fontWeight={600} sx={{display:'block',
          color:errMsg?'error.main':solved?'success.main':'text.secondary'}}>
          {solving?'Verifying you are human…':solved?'Verification complete ✓':errMsg||''}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{fontSize:10}}>
          Privacy-first · No cookies · No tracking · Proof-of-Work
        </Typography>
      </Box>
    </Box>
  );
}

// ─── THEME EDITOR VIEW ───────────────────────────────────────────────────────
function ThemeEditorView({ onBack, showSnack }) {
  const { themeColours, applyThemeColours } = React.useContext(ThemeColoursCtx);
  const [draft, setDraft] = useState({ ...themeColours });
  const [confirmReset, setConfirmReset] = useState(false);

  function update(key, val) { setDraft(d => ({ ...d, [key]: val })); }

  function apply() {
    applyThemeColours(draft);
    showSnack('Theme applied', 'success');
  }

  function applyPreset(preset) {
    setDraft({ ...preset.colours });
    applyThemeColours(preset.colours);
    showSnack(`Theme "${preset.name}" applied`, 'success');
  }

  function reset() {
    setDraft({ ...DEFAULT_THEME_COLOURS });
    applyThemeColours(DEFAULT_THEME_COLOURS);
    setConfirmReset(false);
    showSnack('Theme reset to default', 'info');
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(themeColours);

  const colourFields = [
    { key: 'primary',  label: 'Accent / primary colour',  desc: 'Buttons, highlights, nav underline' },
    { key: 'appBar',   label: 'App bar background',        desc: 'Top navigation bar colour' },
    { key: 'surface',  label: 'Page background',           desc: 'Main page surface — darkest layer' },
    { key: 'card',     label: 'Card / paper background',   desc: 'Cards, dialogs, panels' },
    { key: 'border',   label: 'Border / divider colour',   desc: 'Lines between elements' },
    { key: 'textPri',  label: 'Primary text',              desc: 'Headings and body text' },
    { key: 'textSec',  label: 'Secondary text',            desc: 'Captions and labels' },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <Button startIcon={<ArrowBack/>} onClick={onBack} sx={{ mb: 3 }}>Dashboard</Button>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:3, flexWrap:'wrap', gap:2 }}>
        <Box>
          <Typography variant="h4" sx={{ display:'flex', alignItems:'center', gap:1 }}>
            <PaletteIcon/> Theme Customiser
          </Typography>
          <Typography color="text.secondary">
            Pick a preset or fine-tune individual colours. Changes apply instantly.
          </Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
          <Button variant="outlined" color="warning" onClick={()=>setConfirmReset(true)} startIcon={<RestoreIcon/>}>Reset to default</Button>
          {isDirty && <Button variant="contained" onClick={apply} startIcon={<CheckCircle/>}>Apply changes</Button>}
        </Box>
      </Box>

      {/* ── PRESET TILES ── */}
      <Typography variant="h6" gutterBottom>Presets</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {PRESET_THEMES.map(preset => {
          const isActive = JSON.stringify(themeColours) === JSON.stringify(preset.colours);
          return (
            <Grid item xs={6} sm={4} md={3} key={preset.name}>
              <Paper
                variant="outlined"
                onClick={() => applyPreset(preset)}
                sx={{
                  p: 0, cursor: 'pointer', overflow: 'hidden', borderRadius: 2,
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  transition: 'border-color .2s, transform .15s',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
                }}
              >
                {/* Mini preview */}
                <Box sx={{ height: 64, position:'relative', bgcolor: preset.colours.surface }}>
                  {/* Simulated app bar */}
                  <Box sx={{ height: 14, bgcolor: preset.colours.appBar, borderBottom: `2px solid ${preset.colours.primary}`, display:'flex', alignItems:'center', px:1, gap:.5 }}>
                    <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor: preset.colours.primary }}/>
                    <Box sx={{ height:4, flex:1, borderRadius:2, bgcolor: preset.colours.primary, opacity:.5 }}/>
                  </Box>
                  {/* Simulated cards */}
                  <Box sx={{ display:'flex', gap:.5, p:.75 }}>
                    {[0,1,2].map(i=>(
                      <Box key={i} sx={{ flex:1, height:28, bgcolor:preset.colours.card, borderRadius:1, border:`1px solid ${preset.colours.border}`, display:'flex', flexDirection:'column', p:.4, gap:.3 }}>
                        <Box sx={{ height:4, borderRadius:1, bgcolor:preset.colours.primary, width:i===0?'80%':'60%' }}/>
                        <Box sx={{ height:3, borderRadius:1, bgcolor:preset.colours.textSec, opacity:.4, width:'90%' }}/>
                      </Box>
                    ))}
                  </Box>
                  {isActive && (
                    <Box sx={{ position:'absolute', top:4, right:4 }}>
                      <CheckCircle sx={{ fontSize:16, color:preset.colours.primary }}/>
                    </Box>
                  )}
                </Box>
                <Box sx={{ p:1, bgcolor: preset.colours.card }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: preset.colours.textPri, display:'block' }}>{preset.name}</Typography>
                  <Box sx={{ display:'flex', gap:.4, mt:.5 }}>
                    {['primary','appBar','surface','card','textPri'].map(k=>(
                      <Box key={k} sx={{ width:10, height:10, borderRadius:'50%', bgcolor:preset.colours[k], border:'1px solid rgba(128,128,128,0.3)' }}/>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ── COLOUR EDITOR ── */}
      <Typography variant="h6" gutterBottom>Custom colours</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {colourFields.map(({ key, label, desc }) => (
          <Grid item xs={12} sm={6} key={key}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                {/* Native colour picker */}
                <Box sx={{ position:'relative', flexShrink:0 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: draft[key],
                    border: '2px solid', borderColor: 'divider',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <input
                      type="color"
                      value={draft[key]}
                      onChange={e => update(key, e.target.value)}
                      style={{
                        position:'absolute', inset:0, width:'100%', height:'100%',
                        opacity:0, cursor:'pointer', border:'none', padding:0,
                      }}
                    />
                    <FillIcon sx={{ fontSize:20, color: isDark(draft[key]) ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)', pointerEvents:'none' }}/>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
                  <Typography variant="caption" color="text.secondary">{desc}</Typography>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1, mt:.5 }}>
                    <TextField
                      size="small"
                      value={draft[key]}
                      onChange={e => { if(/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) update(key, e.target.value); }}
                      inputProps={{ style:{ fontFamily:'monospace', fontSize:13, width:80 }, maxLength:7 }}
                      sx={{ '& .MuiInputBase-root':{ height:28 } }}
                    />
                    {/* Quick swatches for this field */}
                    {key==='primary' && (
                      <Box sx={{ display:'flex', gap:.5 }}>
                        {['#D4002B','#1565C0','#2E7D32','#7B1FA2','#F57C00','#C2185B','#455A64','#00838F'].map(c=>(
                          <Tooltip key={c} title={c}>
                            <Box onClick={()=>update(key,c)} sx={{ width:18, height:18, borderRadius:'50%', bgcolor:c, cursor:'pointer', border:'2px solid', borderColor:draft[key]===c?'white':'transparent', '&:hover':{ transform:'scale(1.2)' }, transition:'transform .1s' }}/>
                          </Tooltip>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
                {/* Preview swatch */}
                <Box sx={{ width:32, height:32, borderRadius:1, bgcolor:draft[key], border:'1px solid', borderColor:'divider', flexShrink:0 }}/>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── LIVE PREVIEW ── */}
      <Typography variant="h6" gutterBottom>Live preview</Typography>
      <Paper variant="outlined" sx={{ overflow:'hidden', borderRadius:2 }}>
        {/* Mini app bar */}
        <Box sx={{ bgcolor:draft.appBar, borderBottom:`3px solid ${draft.primary}`, px:2, py:1, display:'flex', alignItems:'center', gap:1 }}>
          <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:draft.primary }}/>
          <Typography variant="caption" sx={{ color:draft.textPri, fontWeight:700, flex:1 }}>CyberCBT — Preview</Typography>
          {[0,1,2].map(i=><Box key={i} sx={{ width:24, height:24, borderRadius:1, bgcolor:`${draft.primary}30` }}/>)}
        </Box>
        {/* Mini content */}
        <Box sx={{ bgcolor:draft.surface, p:2 }}>
          <Grid container spacing={1.5}>
            {/* Stat cards */}
            {['Modules','Score','Certs'].map((label,i)=>(
              <Grid item xs={4} key={label}>
                <Box sx={{ bgcolor:draft.card, border:`1px solid ${draft.border}`, borderRadius:1.5, p:1.5 }}>
                  <Typography variant="caption" sx={{ color:draft.textSec, display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:.5 }}>{label}</Typography>
                  <Typography variant="h6" sx={{ color:draft.textPri, fontWeight:700 }}>{['4/4','85%','3'][i]}</Typography>
                </Box>
              </Grid>
            ))}
            {/* Hero card */}
            <Grid item xs={12}>
              <Box sx={{ bgcolor:`linear-gradient(135deg, ${draft.appBar}, ${draft.card})`, background:`linear-gradient(135deg, ${draft.appBar}, ${draft.card})`, border:`1px solid ${draft.primary}40`, borderRadius:1.5, p:2 }}>
                <Typography variant="caption" sx={{ color:draft.textSec, textTransform:'uppercase', fontSize:10 }}>Suggested next</Typography>
                <Typography variant="subtitle1" sx={{ color:draft.textPri, fontWeight:700 }}>Defending Against Phishing</Typography>
                <Box sx={{ display:'flex', gap:1, mt:1 }}>
                  <Box sx={{ bgcolor:draft.primary, color: isDark(draft.primary)?'white':'#1D1D1B', borderRadius:1, px:1.5, py:.25, fontSize:11, fontWeight:700 }}>Read first</Box>
                  <Box sx={{ border:`1px solid ${draft.border}`, color:draft.textSec, borderRadius:1, px:1.5, py:.25, fontSize:11 }}>Jump to quiz</Box>
                </Box>
              </Box>
            </Grid>
            {/* Progress bars */}
            {['Phishing','Passwords','Devices','Reporting'].map((m,i)=>(
              <Grid item xs={6} key={m}>
                <Box sx={{ bgcolor:draft.card, border:`1px solid ${draft.border}`, borderRadius:1.5, p:1 }}>
                  <Typography variant="caption" sx={{ color:draft.textPri, fontSize:10, fontWeight:600 }}>{m}</Typography>
                  <Box sx={{ mt:.5, height:4, bgcolor:draft.border, borderRadius:2 }}>
                    <Box sx={{ height:'100%', width:`${[85,72,60,90][i]}%`, bgcolor:draft.primary, borderRadius:2 }}/>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ display:'flex', gap:1.5, mt:3 }}>
        <Button variant="contained" onClick={apply} startIcon={<PaletteIcon/>} size="large" disabled={!isDirty}>
          Apply theme
        </Button>
        <Button variant="outlined" onClick={()=>setDraft({...themeColours})}>
          Revert changes
        </Button>
      </Box>

      <ConfirmDialog
        open={confirmReset} title="Reset to default theme?"
        body="This will restore the original Comp X dark colour scheme."
        onConfirm={reset} onCancel={()=>setConfirmReset(false)}
        busy={false} confirmLabel="Yes, reset" confirmColor="warning"
      />
    </Box>
  );
}
