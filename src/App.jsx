import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ═══════════════════════════════════════
// CORE: Lunar Calendar & Hash
// ═══════════════════════════════════════
const LI=[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,0x14b63];
function lyd(y){let s=348;for(let i=0x8000;i>0x8;i>>=1)s+=(LI[y-1900]&i)?1:0;return s+lpd(y)}
function lpm(y){return LI[y-1900]&0xf}
function lpd(y){if(lpm(y))return(LI[y-1900]&0x10000)?30:29;return 0}
function mmd(y,m){return(LI[y-1900]&(0x10000>>m))?30:29}
function s2l(sy,sm,sd){let o=Math.floor((Date.UTC(sy,sm-1,sd)-Date.UTC(1900,0,31))/86400000),ly=1900,t;for(;ly<2101&&o>0;ly++){t=lyd(ly);o-=t}if(o<0){o+=t;ly--}let il=false,lm2=lpm(ly),lm=1;for(;lm<13&&o>0;lm++){if(lm2>0&&lm===lm2+1&&!il){--lm;il=true;t=lpd(ly)}else{t=mmd(ly,lm)}if(il&&lm===lm2+1)il=false;o-=t}if(o===0&&lm2>0&&lm===lm2+1){if(il)il=false;else{il=true;--lm}}if(o<0){o+=t;--lm}return{year:ly,month:lm,day:o+1}}
function l2s(ly,lm,ld){let o=0;for(let yr=1900;yr<ly;yr++)o+=lyd(yr);const lm2=lpm(ly);let passed=false;for(let m=1;m<lm;m++){if(lm2>0&&m===lm2&&!passed){o+=lpd(ly);passed=true}o+=mmd(ly,m)}o+=ld-1;const d=new Date(Date.UTC(1900,0,31)+o*86400000);return{year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()}}
function hs(a,b,c,d){let h=((a*2654435761)^(b*2246822519)^(c*3266489917)^(d*668265263))>>>0;h=Math.imul(h^(h>>>16),0x45d9f3b);h=Math.imul(h^(h>>>16),0x45d9f3b);return((h^(h>>>16))>>>0)/4294967296}
const ST=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BR=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const PN=["命宮","兄弟宮","夫妻宮","子女宮","財帛宮","疾厄宮","遷移宮","交友宮","事業宮","田宅宮","福德宮","父母宮"];
const getSC=h=>Math.floor(((h+1)%24)/2);
const SC_OPT=[{l:"子時（23-01）",v:0},{l:"丑時（01-03）",v:2},{l:"寅時（03-05）",v:4},{l:"卯時（05-07）",v:6},{l:"辰時（07-09）",v:8},{l:"巳時（09-11）",v:10},{l:"午時（11-13）",v:12},{l:"未時（13-15）",v:14},{l:"申時（15-17）",v:16},{l:"酉時（17-19）",v:18},{l:"戌時（19-21）",v:20},{l:"亥時（21-23）",v:22}];

// ═══════════════════════════════════════
// ZODIAC + LIFE PATH + HUMAN DESIGN + MAYAN + BAZI
// ═══════════════════════════════════════
const ZD=[[1,20,"水瓶座"],[2,19,"雙魚座"],[3,21,"牡羊座"],[4,20,"金牛座"],[5,21,"雙子座"],[6,21,"巨蟹座"],[7,23,"獅子座"],[8,23,"處女座"],[9,23,"天秤座"],[10,23,"天蠍座"],[11,22,"射手座"],[12,22,"摩羯座"]];
function getZodiac(m,d){for(let i=11;i>=0;i--)if(m>ZD[i][0]||(m===ZD[i][0]&&d>=ZD[i][1]))return ZD[i][2];return"摩羯座"}
const ZT={"牡羊座":{el:"火",tr:["行動力強","勇於冒險","天生領導者"],en:"開創",sh:"容易衝動，缺乏耐心",love:"你在感情中熱烈而直接，一旦喜歡就勇敢追求。但有時太急於推進關係。學會慢下來，愛情反而更快到來。",career:"創業、業務開發、專案啟動都是你的舞台。你需要能發揮自主性的環境。",health:"頭部是弱點，壓力大時容易頭痛失眠。高強度運動能幫你燃燒過剩能量。",compat:["獅子座","射手座","水瓶座"]},"金牛座":{el:"土",tr:["穩定可靠","品味出眾","天生理財家"],en:"穩固",sh:"過於固執，抗拒改變",love:"你是最忠誠的伴侶，用行動而非語言表達愛。但佔有慾可能讓對方感到壓力。",career:"金融、設計、美食、園藝。你穩紮穩打累積財富。",health:"喉嚨和甲狀腺敏感。容易用吃紓壓，注意均衡飲食。",compat:["處女座","摩羯座","巨蟹座"]},"雙子座":{el:"風",tr:["聰明機智","口才出眾","多才多藝"],en:"連結",sh:"三分鐘熱度，難以專注",love:"你需要能跟你聊不停的伴侶。無聊是你感情中最大的殺手。",career:"媒體、行銷、教學、寫作。你可能有不只一份事業。",health:"手臂肩膀和神經系統容易緊張。冥想能安定你永遠在轉的腦袋。",compat:["天秤座","水瓶座","牡羊座"]},"巨蟹座":{el:"水",tr:["溫柔體貼","直覺敏銳","守護力量"],en:"滋養",sh:"過度敏感，容易情緒化",love:"你是天生的照顧者，會把伴侶當成全世界。但小心不要把「被需要」當成「被愛」。",career:"教育、心理諮商、餐飲、室內設計。",health:"胃是敏感區域，情緒直接影響消化系統。",compat:["天蠍座","雙魚座","金牛座"]},"獅子座":{el:"火",tr:["自信光芒","舞台感強","慷慨大方"],en:"創造",sh:"過度驕傲，需要被關注",love:"你在愛情中是女王般的存在。你也需要大量讚美和認可。找到欣賞你光芒的人至關重要。",career:"表演藝術、管理層、品牌經營。你天生就會成為最亮眼的人。",health:"心臟和脊椎需要關注。保持運動讓火焰穩定燃燒。",compat:["牡羊座","射手座","天秤座"]},"處女座":{el:"土",tr:["分析力強","追求完美","服務精神"],en:"精煉",sh:"過度批判自己與他人",love:"你用細微的服務表達愛，會記住對方所有小習慣。但完美主義會讓你太挑剔。",career:"醫療、數據分析、編輯、品質管理。你發現細節的眼睛是無價之寶。",health:"腸胃和消化系統是弱點。冥想能大幅改善你的焦慮。",compat:["金牛座","摩羯座","天蠍座"]},"天秤座":{el:"風",tr:["優雅和諧","社交天才","審美獨到"],en:"平衡",sh:"猶豫不決，過度在意他人",love:"你為愛而生，渴望完美的伴侶關係。但記得一個人也可以很完整。不要為了避免獨處而將就。",career:"法律、外交、藝術策展、公關。你天生懂得找到平衡。",health:"腎臟和下背部需要注意。噪音和混亂會直接影響你的健康。",compat:["雙子座","水瓶座","獅子座"]},"天蠍座":{el:"水",tr:["洞察驚人","意志堅定","深度感知"],en:"轉化",sh:"佔有慾強，不易信任他人",love:"你愛得深沉而強烈，要嘛全心全意要嘛完全不要。你需要能承受你情感深度的人。",career:"心理學、偵查、研究、投資。在需要深度的領域你是王者。",health:"生殖系統敏感。你傾向壓抑情緒但身體會記住——找到釋放出口。",compat:["巨蟹座","雙魚座","處女座"]},"射手座":{el:"火",tr:["樂觀自由","哲學思維","熱愛探索"],en:"擴展",sh:"過度理想化，缺乏紀律",love:"你需要一起冒險的伴侶。承諾不等於牢籠，穩定的愛也可以很自由。",career:"旅遊業、高等教育、出版、國際貿易。你的靈魂需要廣闊的天空。",health:"臀部和大腿容易受傷。冒險之餘記得保護自己。",compat:["牡羊座","獅子座","水瓶座"]},"摩羯座":{el:"土",tr:["務實堅毅","責任感強","目標導向"],en:"建構",sh:"過度壓抑情感，容易變工作狂",love:"你是隱藏的寶藏——外冷內熱。一旦認定對方，你的忠誠和付出無與倫比。",career:"企業管理、建築、金融。你是大器晚成型，30歲後越來越好。",health:"骨骼牙齒和膝蓋是弱點。休息不是偷懶。",compat:["金牛座","處女座","天蠍座"]},"水瓶座":{el:"風",tr:["獨立思考","人道精神","創新先驅"],en:"革新",sh:"情感疏離，過度理想化",love:"你需要靈魂伴侶——能懂你奇怪想法的人。別因為覺得友情更重要就拒絕親密。",career:"科技、社會運動、發明。你是來自未來的人。",health:"小腿和循環系統需要注意。定期身體檢查很重要。",compat:["雙子座","天秤座","射手座"]},"雙魚座":{el:"水",tr:["共感力強","藝術天賦","靈性深邃"],en:"療癒",sh:"逃避現實，界限模糊",love:"你是最浪漫的星座。但容易把對方理想化，也容易在不健康的關係中迷失。學會設定界限。",career:"藝術、音樂、靈性療癒、慈善事業。你的共感力是超能力。",health:"腳部和免疫系統脆弱。你對環境能量很敏感，需要定期獨處充電。",compat:["巨蟹座","天蠍座","金牛座"]}};
function getLP(y,m,d){let n=`${y}${String(m).padStart(2,"0")}${String(d).padStart(2,"0")}`.split("").reduce((a,c)=>a+ +c,0);while(n>9&&n!==11&&n!==22&&n!==33)n=`${n}`.split("").reduce((a,c)=>a+ +c,0);return n}
const LPD={1:{t:"領導者",d:"你是天生的開拓者，擁有獨立自主的靈魂。你來到這世界就是為了走沒人走過的路。",g:["領導力","創新力","獨立"],love:"你需要尊重你獨立性的伴侶。學會偶爾示弱——這不是軟弱而是信任。",career:"創業、自由職業或任何能讓你做主的角色。你天生就是要開創自己的事業。",ch:"在堅持自我的同時接納他人。獨行俠走得快，團隊走得遠。",best:[3,5,7],avoid:[8,4],lover:5,noble:9},2:{t:"和平使者",d:"你是天生的調和者，能感知到別人注意不到的細微情緒和能量。",g:["共情力","合作","直覺"],love:"你天生懂得維繫關係，但小心不要為了和諧而委屈自己。",career:"諮商、調解、藝術創作。你是天生的幕後推手。",ch:"學會為自己發聲。你太容易把別人放在自己前面。",best:[4,6,8],avoid:[5,1],lover:6,noble:8},3:{t:"表達者",d:"你是天生的藝術家，你的笑容和話語有治癒人心的魔力。",g:["創造力","溝通","幽默"],love:"你需要欣賞你創造力的伴侶。風趣迷人的你需要學會更深入的情感表達。",career:"寫作、表演、設計、演講。任何能讓你表達的平台都是你的舞台。",ch:"找到真正屬於你的聲音，而非迎合他人的期待。",best:[1,5,9],avoid:[4,7],lover:9,noble:6},4:{t:"建造者",d:"你是天生的實踐家，你把混亂變成秩序，把夢想變成現實。",g:["執行力","組織","忠誠"],love:"你在感情中可靠得像一座山。但偶爾的浪漫也很重要。",career:"工程、建築、項目管理。你是讓事情「落地」的人。",ch:"在穩定中保持彈性。不是所有事情都需要計畫。",best:[2,6,8],avoid:[3,5],lover:8,noble:2},5:{t:"自由靈魂",d:"你是天生的冒險家，對世界充滿好奇。你的人生就是一場精彩探險。",g:["適應力","勇氣","多元"],love:"你需要空間和自由。但學會在自由中建立承諾才是真正的成長。",career:"旅遊、銷售、媒體。你適合變化多端的工作環境。",ch:"在追求自由中找到內在的定錨點。不是每次無聊就要換跑道。",best:[1,3,7],avoid:[2,4],lover:1,noble:7},6:{t:"療癒者",d:"你是天生的照顧者，你的存在讓周圍的人感到安全。",g:["愛","責任感","美感"],love:"你是完美的伴侶，但小心「救世主情結」。愛自己是第一課。",career:"教育、醫療、室內設計。任何能照顧他人的工作。",ch:"愛人先愛己。責任不等於犧牲。",best:[2,4,9],avoid:[1,7],lover:2,noble:3},7:{t:"探索者",d:"你是天生的哲學家，你總在追尋生命更深的意義。",g:["分析力","靈性","智慧"],love:"你需要能深度對話的伴侶。但也別因太挑而錯過好人。",career:"研究、哲學、心理學、靈性療癒。需要深度思考的工作。",ch:"平衡精神追求與現實生活。身體也需要被照顧。",best:[1,5,9],avoid:[3,6],lover:3,noble:5},8:{t:"成就者",d:"你是天生的權力掌握者。你來這裡就是為了做大事。",g:["商業頭腦","決斷","影響力"],love:"你追求「最好的」，但真正的富足來自內心的豐盛。",career:"商業、金融、管理、政治。你有登頂的野心和實力。",ch:"真正的富足不只是金錢。用影響力去造福他人。",best:[2,4,6],avoid:[1,9],lover:4,noble:22},9:{t:"智者",d:"你是天生的人道主義者，你看到的是全人類而非只是自己。",g:["同理心","大愛","智慧"],love:"你的愛是博大的，但也要學會給出專屬的愛。",career:"慈善事業、藝術、國際組織。讓世界更好是你的使命。",ch:"學會放手和完結。結束才能帶來新的開始。",best:[3,6,7],avoid:[8,5],lover:3,noble:1},11:{t:"靈性導師",d:"大師數靈魂，你能看到別人看不到的真相。",g:["靈感","啟發","通靈"],love:"你需要理解你靈性面的伴侶。你的敏感度很高。",career:"靈性教師、藝術家、發明家。你的直覺是最強工具。",ch:"將靈性洞見落地。光有遠見不夠，要帶到地面上。",best:[2,6,9],avoid:[8,4],lover:2,noble:9},22:{t:"夢想建築師",d:"大師數靈魂，擁有將宏大願景化為現實的驚人能力。",g:["遠見","實踐","轉化"],love:"你對一切標準都很高。學會接受不完美的美好。",career:"大型企業、社會改革。你是來建造改變世界的東西的。",ch:"克服內在恐懼。你的潛力巨大，但也背負巨大壓力。",best:[4,6,8],avoid:[5,3],lover:4,noble:8},33:{t:"宇宙治療師",d:"最稀有的大師數，你的存在本身就有療癒力。",g:["大愛","奉獻","慈悲"],love:"你的愛超越個人層面，但也需要在親密關係中表達具體的愛。",career:"靈性領袖、治療師、人道主義工作。",ch:"超越個人苦難，成為集體的療癒力量。",best:[6,9,11],avoid:[1,5],lover:6,noble:9}};
const HD_GATES={1:{c:"g",n:"自我表達",k:"創造力",d:"獨特創意的閘門，把內在靈感化為獨特創作。"},2:{c:"g",n:"接收方向",k:"高我方向",d:"你擁有內在GPS，在正確時機接收人生方向。"},3:{c:"sacral",n:"秩序",k:"開創混沌",d:"混亂中誕生秩序，你是新事物萌芽的催化劑。"},4:{c:"ajna",n:"公式化",k:"邏輯答案",d:"找到邏輯解決方案的天賦。"},5:{c:"sacral",n:"固定模式",k:"等待時機",d:"建立穩定節奏，等待正確時機才高效。"},6:{c:"emo",n:"衝突",k:"情感親密",d:"在摩擦中磨出真正親密與信任。"},7:{c:"g",n:"軍隊",k:"民主領導",d:"天生的引導者，用影響力帶領方向。"},8:{c:"throat",n:"貢獻",k:"獨特貢獻",d:"透過獨特表達為世界做出貢獻。"},9:{c:"sacral",n:"專注",k:"聚焦細節",d:"在反覆打磨中發現深度。"},10:{c:"g",n:"前進",k:"自我行為",d:"活出真實自我的閘門。"},11:{c:"ajna",n:"和平",k:"新想法",d:"源源不絕的靈感泉源。"},12:{c:"throat",n:"靜止",k:"謹慎表達",d:"在正確時機開口的智慧。"},13:{c:"g",n:"傾聽者",k:"秘密的聆聽",d:"天生的聆聽者和故事收藏家。"},14:{c:"sacral",n:"權力技巧",k:"富足力量",d:"把熱情轉化為財富的天賦。"},15:{c:"g",n:"謙遜",k:"極端節奏",d:"包容所有人類行為模式的寬廣胸懷。"},16:{c:"throat",n:"技藝",k:"熱忱",d:"透過反覆練習達到精通。"},17:{c:"ajna",n:"跟隨",k:"意見觀點",d:"形成和分享觀點的天賦。"},18:{c:"spleen",n:"糾正",k:"挑戰模式",d:"發現可改進之處的直覺。"},19:{c:"root",n:"靠近",k:"需要資源",d:"對資源和情感需求的敏感度。"},20:{c:"throat",n:"注視",k:"當下覺知",d:"活在當下，在此刻覺知中展現力量。"},21:{c:"will",n:"獵人",k:"掌控",d:"掌握資源和局面的意志力。"},22:{c:"emo",n:"優雅",k:"開放",d:"透過情感開放和優雅感動他人。"},23:{c:"throat",n:"裂開",k:"同化",d:"將複雜概念簡化表達。"},24:{c:"ajna",n:"回歸",k:"合理化",d:"在反覆思考中找到深層理解。"},25:{c:"g",n:"天真",k:"無條件的愛",d:"無條件去愛的能力。"},26:{c:"will",n:"馴服的力量",k:"利己者",d:"用說服力和策略達成目標。"},27:{c:"sacral",n:"滋養",k:"照顧",d:"滋養和照顧他人的深厚能量。"},28:{c:"spleen",n:"偉大",k:"冒險玩家",d:"在風險中發現意義的勇氣。"},29:{c:"sacral",n:"深淵",k:"承諾",d:"全心投入，一旦承諾義無反顧。"},30:{c:"emo",n:"燃燒的火焰",k:"慾望感受",d:"強烈渴望的火焰，點燃身邊的人。"},31:{c:"throat",n:"影響",k:"領導力",d:"天生的領袖聲音。"},32:{c:"spleen",n:"持久",k:"連續性",d:"辨識什麼能持久的直覺。"},33:{c:"throat",n:"隱退",k:"記憶",d:"記錄和分享經驗的閘門。"},34:{c:"sacral",n:"強大的力量",k:"純粹的力量",d:"原始而強大的生命力。"},35:{c:"throat",n:"變易",k:"體驗人生",d:"渴望體驗一切。"},36:{c:"emo",n:"幽暗",k:"危機",d:"在情緒風暴中蛻變。"},37:{c:"emo",n:"家人",k:"友誼",d:"建立家庭般溫暖連結。"},38:{c:"root",n:"對抗",k:"戰士",d:"為信念而戰的能量。"},39:{c:"root",n:"挑釁",k:"挑動情緒",d:"催化他人覺醒。"},40:{c:"will",n:"遞送",k:"孤獨",d:"在獨處中恢復能量。"},41:{c:"root",n:"減少",k:"幻想收縮",d:"聚焦找到最重要的。"},42:{c:"sacral",n:"增加",k:"完成成長",d:"把事情做到圓滿完成。"},43:{c:"ajna",n:"突破",k:"洞見",d:"突破性洞見，領先時代。"},44:{c:"spleen",n:"聚合",k:"模式直覺",d:"辨識成功模式的直覺。"},45:{c:"throat",n:"聚集",k:"國王女王",d:"聚集資源和人脈的皇室能量。"},46:{c:"g",n:"推動",k:"身體的愛",d:"與身體深刻連結。"},47:{c:"ajna",n:"壓抑",k:"領悟",d:"在混亂中突然看見全局。"},48:{c:"spleen",n:"井",k:"深度",d:"深不見底的知識之井。"},49:{c:"emo",n:"革命",k:"原則",d:"為原則而革命的力量。"},50:{c:"spleen",n:"守護",k:"價值觀",d:"守護群體價值和規範。"},51:{c:"will",n:"激起",k:"衝擊",d:"在衝擊中覺醒。"},52:{c:"root",n:"靜止",k:"專注靜定",d:"在靜止中累積力量。"},53:{c:"root",n:"發展",k:"新的開始",d:"推動新循環開始。"},54:{c:"root",n:"少女出嫁",k:"野心驅動",d:"向上攀升的野心。"},55:{c:"emo",n:"豐盛",k:"精神豐盛",d:"內在富足不依賴外在。"},56:{c:"throat",n:"旅人",k:"刺激尋找",d:"用故事啟發想像。"},57:{c:"spleen",n:"溫柔",k:"直覺清晰",d:"最銳利的直覺閘門。"},58:{c:"root",n:"喜悅",k:"活力喜悅",d:"為生命帶來喜悅和活力。"},59:{c:"sacral",n:"分散",k:"親密突破",d:"突破藩籬建立親密。"},60:{c:"root",n:"限制",k:"接受限制",d:"在限制中找到突變。"},61:{c:"head",n:"內在真理",k:"神秘啟示",d:"接收宇宙靈感的天線。"},62:{c:"throat",n:"優先",k:"細節表達",d:"精確表達細節的天賦。"},63:{c:"head",n:"完成之後",k:"邏輯懷疑",d:"用邏輯質疑追求答案。"},64:{c:"head",n:"完成之前",k:"抽象混沌",d:"在混沌中看到可能性。"}};
const HD_CHANNELS=[[1,8,"g","throat","啟發通道","創造角色模型","天生的創意表達者，用獨特風格啟發他人。"],[2,14,"g","sacral","脈動通道","天賦轉化財富","把內在天賦轉化為物質豐盛的獨特能力。"],[3,60,"sacral","root","突變通道","突破限制","攜帶基因突變的力量，在壓力下產生新可能。"],[4,63,"ajna","head","邏輯通道","邏輯思維","清晰的邏輯推理，看穿因果關係。"],[5,15,"sacral","g","韻律通道","自然節奏","與宇宙自然節奏同步。"],[6,59,"emo","sacral","親密通道","情感連結","建立深度親密關係的天賦。"],[7,31,"g","throat","領導通道","以身作則","天生領袖，影響力來自示範。"],[9,52,"sacral","root","專注通道","聚焦力量","驚人的專注力，深入細節持續打磨。"],[10,20,"g","throat","覺醒通道","當下表達","活在當下的覺知，展現最真實的自己。"],[10,34,"g","sacral","探索通道","追求信念","用強大生命力追求自我信念。"],[10,57,"g","spleen","完美形式","直覺生存","直覺指引活出最完美的自我形式。"],[11,56,"ajna","throat","好奇通道","靈感故事","把腦中想法轉化為引人入勝的故事。"],[12,22,"throat","emo","開放通道","社交表達","社交中展現情感智慧。"],[13,33,"g","throat","浪子通道","經驗分享","人生經驗的收藏家和分享者。"],[16,48,"throat","spleen","才華通道","技能精通","深度專業透過練習轉化為才華。"],[17,62,"ajna","throat","接納通道","邏輯表達","有條理地表達觀點和意見。"],[18,58,"spleen","root","批評通道","完美追求","直覺發現任何可改進之處。"],[19,49,"root","emo","合成通道","敏感革命","對群體需求敏感度極高。"],[20,34,"throat","sacral","魅力通道","力量展現","在回應中展現強大個人力量。"],[20,57,"throat","spleen","腦波通道","直覺覺知","直覺在當下即時運作。"],[21,45,"will","throat","金錢線","物質掌控","天生懂得管控資源和物質。"],[23,43,"throat","ajna","架構通道","洞見表達","把獨特頓悟轉化為可理解的語言。"],[24,61,"ajna","head","覺察通道","靈感思維","將神秘靈感合理化。"],[25,51,"g","will","發起通道","愛的勇氣","用無條件的愛發起新事物。"],[26,44,"will","spleen","投降通道","商業直覺","直覺模式辨識力轉化為說服力。"],[27,50,"sacral","spleen","保存通道","守護照顧","照顧守護他人的深厚能量。"],[28,38,"spleen","root","掙扎通道","意義戰士","為找到生命意義而不懈奮戰。"],[29,46,"sacral","g","發現通道","承諾幸運","全心投入帶來意想不到的幸運。"],[30,41,"emo","root","辨識通道","渴望聚焦","把強烈渴望聚焦成改變人生的體驗。"],[32,54,"spleen","root","蛻變通道","野心蛻變","本能驅動的野心推動持續進化。"],[34,57,"sacral","spleen","力量通道","直覺力量","直覺引導的強大生命力。"],[35,36,"throat","emo","無常通道","體驗人生","渴望並擁抱人生一切體驗。"],[37,40,"emo","will","社群通道","社區歸屬","懂得付出和獨處的平衡。"],[39,55,"root","emo","情緒通道","豐盛催化","挑動情緒催化精神覺醒。"],[42,53,"sacral","root","成熟通道","循環完成","開始並完成成長循環。"],[47,64,"ajna","head","抽象通道","混沌領悟","在混沌資訊中突然頓悟全局。"]];
const HD_CN={head:"頂輪",ajna:"心智中心",throat:"喉輪",g:"G中心",will:"意志力中心",sacral:"薦骨中心",spleen:"直覺中心",emo:"情緒中心",root:"根部中心"};
const HD_CT={head:{def:"持續的靈感壓力驅動深度思考",undef:"容易被別人的問題吸引而分心",bio:"靈感與啟發"},ajna:{def:"固定的思維方式，穩定的概念化能力",undef:"開放看待不同觀點，思維靈活",bio:"邏輯與觀點"},throat:{def:"穩定的表達和顯化能力",undef:"表達方式隨環境而變",bio:"表達與顯化"},g:{def:"固定的人生方向和身份認同",undef:"在不同環境展現不同面向",bio:"愛與方向"},will:{def:"持續的意志力和自我價值感",undef:"不需靠意志力證明自己",bio:"意志力與價值"},sacral:{def:"持續穩定的生命力和工作能量",undef:"沒有固定能量供應，善用而非透支",bio:"生命力與回應"},spleen:{def:"穩定的直覺和免疫系統",undef:"對環境能量特別敏感",bio:"直覺與生存"},emo:{def:"情緒波動是你的決策工具",undef:"容易放大他人情緒",bio:"情緒與感受"},root:{def:"持續壓力驅動力，適合壓力下工作",undef:"容易被外在壓力催趕",bio:"壓力與驅動"}};
function getHD(y,m,d,h){
const authArr=["薦骨回應","情緒波","脾直覺","自我投射","意志力","環境/月亮"];const auth=authArr[Math.floor(hs(y,d,m,h+1)*6)];
const defArr=["1/3 探究烈士","2/4 隱士機會者","3/5 實驗異端","4/6 機會典範","5/1 異端探究","6/2 典範隱士"];const def=defArr[Math.floor(hs(d,m,y,h)*6)];
const crossArr=["右角度十字架—計劃","右角度十字架—人面獅身","右角度十字架—意識","左角度十字架—革命","左角度十字架—教育","並列十字架—貢獻"];const cross=crossArr[Math.floor(hs(y+d,m,h,7)*6)];
const planets=["太陽","地球","月亮","北交點","南交點","水星","金星","火星","木星","土星","天王星","海王星","冥王星"];
const pGates=[],dGates=[];
for(let pi=0;pi<13;pi++){const pH=hs(y,m+pi,d,h+pi*3);pGates.push({gate:Math.floor(pH*64)+1,line:Math.floor(hs(y+pi,d,m,h+pi)*6)+1,planet:planets[pi],type:"personality"});const dd=new Date(y,m-1,d);dd.setDate(dd.getDate()-88);const dy=dd.getFullYear(),dm2=dd.getMonth()+1,ddd=dd.getDate();const dH=hs(dy,dm2+pi,ddd,h+pi*5);dGates.push({gate:Math.floor(dH*64)+1,line:Math.floor(hs(dy+pi,ddd,dm2,h+pi)*6)+1,planet:planets[pi],type:"design"})}
const allAct=[...pGates,...dGates];const activeGateSet=new Set(allAct.map(a=>a.gate));
const gateDetails={};allAct.forEach(a=>{if(!gateDetails[a.gate])gateDetails[a.gate]={...HD_GATES[a.gate],num:a.gate,activations:[]};gateDetails[a.gate].activations.push(a)});
const activeChannels=[];HD_CHANNELS.forEach(ch=>{const[g1,g2,c1,c2,name,keynote,desc]=ch;if(activeGateSet.has(g1)&&activeGateSet.has(g2))activeChannels.push({g1,g2,c1,c2,name,keynote,desc})});
const definedCenters=new Set();activeChannels.forEach(ch=>{definedCenters.add(ch.c1);definedCenters.add(ch.c2)});
const centerOrder=["head","ajna","throat","g","will","sacral","spleen","emo","root"];
const centers=centerOrder.map(key=>({key,name:HD_CN[key],defined:definedCenters.has(key),theme:HD_CT[key],gates:Object.values(gateDetails).filter(g=>g.c===key),channels:activeChannels.filter(ch=>ch.c1===key||ch.c2===key)}));
const hasSacral=definedCenters.has("sacral"),motorToThroat=activeChannels.some(ch=>{const motors=["sacral","root","will","emo"];return(ch.c1==="throat"&&motors.includes(ch.c2))||(ch.c2==="throat"&&motors.includes(ch.c1))});
let type,st,desc2,pct,sig,notSelf,tips,energy;
if(hasSacral&&motorToThroat){type="顯示生產者";st="等待回應再告知";pct="33%";sig="滿足感＋平靜";notSelf="挫敗＋憤怒";desc2="你是多工天才，人生是華麗的之字形冒險。你會跳過不必要的步驟，用最快速度到達終點。記得行動前通知身邊重要的人。";tips="你的效率驚人，但「跳步驟」會讓別人跟不上。慢下來不是浪費時間。";energy="你同時擁有薦骨持續能量和喉嚨顯化力。但不是每件事都需要你插手。"}
else if(hasSacral){type="生產者";st="等待回應";pct="37%";sig="滿足感";notSelf="挫敗感";desc2="你的能量如太陽般持續發光。當外界給你訊號時，身體會用薦骨的「嗯哼」回應。";tips="每天問自己：做的事讓我滿足嗎？追隨滿足感。";energy="你擁有持續穩定的薦骨能量，是世界的建造者。"}
else if(motorToThroat&&!hasSacral){type="顯示者";st="告知";pct="8%";sig="平靜";notSelf="憤怒";desc2="你是開路先鋒，擁有點燃火花的能力。唯一秘訣是行動前告知你在乎的人。";tips="你的氣場是封閉的，主動告知能減少阻力。";energy="你擁有強大的爆發力和啟動能量。"}
else if(definedCenters.size===0){type="反映者";st="等待月亮週期";pct="1%";sig="驚喜";notSelf="失望";desc2="你是極其稀有的存在，像一面清澈的鏡子。給自己28天來做重大決策。";tips="選擇正確的環境對你至關重要。";energy="你的能量完全取決於環境。"}
else{type="投射者";st="等待邀請";pct="21%";sig="成功";notSelf="苦澀感";desc2="你是天生的引導者，能看穿他人的天賦。等待邀請不是被動——是深刻的自我信任。";tips="最大的陷阱是沒被邀請就給建議。";energy="你沒有持續的薦骨能量，你的超能力是「看見」別人看不見的東西。"}
return{type,st,auth,def,cross,desc:desc2,pct,sig,notSelf,tips,energy,pGates,dGates,allActivations:allAct,gateDetails,activeGateSet,activeChannels,definedCenters,centers,centerOrder}}
const MSL=["紅龍","白風","藍夜","黃種子","紅蛇","白世界橋","藍手","黃星星","紅月","白狗","藍猴","黃人","紅天行者","白巫師","藍鷹","黃戰士","紅地球","白鏡","藍風暴","黃太陽"];
const MTN=["磁性","月亮","電力","自我存在","超頻","韻律","共振","銀河","太陽","行星","光譜","水晶","宇宙"];
const MDS={"紅龍":{c:"滋養與誕生",d:"孕育新開始的力量",g:"信任生命會照顧你",pw:"原始信任",ch:"過度照顧而忽略自己"},"白風":{c:"溝通與靈感",d:"宇宙訊息的傳遞者",g:"真實的表達是你的力量",pw:"呼吸與靈感",ch:"散漫缺乏方向"},"藍夜":{c:"豐盛與夢境",d:"透過夢接收宇宙訊息",g:"相信你的夢想",pw:"豐盛顯化",ch:"過度沉浸幻想"},"黃種子":{c:"開花與目標",d:"每個決定都會綻放",g:"最美的花需要最長時間",pw:"耐心與信念",ch:"過度期待結果"},"紅蛇":{c:"生命力與本能",d:"強大的生存智慧",g:"信任你的身體直覺",pw:"生命力",ch:"恐懼與執著"},"白世界橋":{c:"連接與放下",d:"不同世界的橋樑",g:"放下才能得到",pw:"連結超越",ch:"害怕改變"},"藍手":{c:"療癒與知曉",d:"雙手擁有療癒能量",g:"用雙手去創造療癒",pw:"療癒之手",ch:"過度控制"},"黃星星":{c:"美與藝術",d:"感知宇宙的和諧",g:"把美帶入日常生活",pw:"藝術創造",ch:"追求完美"},"紅月":{c:"淨化與流動",d:"水般的療癒力",g:"讓情緒像水一樣流動",pw:"淨化療癒",ch:"情緒氾濫"},"白狗":{c:"愛與忠誠",d:"心輪特別強大",g:"先學會無條件愛自己",pw:"忠誠之愛",ch:"過度付出"},"藍猴":{c:"遊戲與幻象",d:"看穿表象的智慧",g:"別把人生看太嚴肅",pw:"幽默魔法",ch:"逃避責任"},"黃人":{c:"自由意志",d:"獨立思考的勇氣",g:"勇敢做自己的選擇",pw:"自由意志",ch:"過度自我"},"紅天行者":{c:"探索與空間",d:"靈魂渴望穿越時空",g:"保持好奇心",pw:"空間旅行",ch:"無法安定"},"白巫師":{c:"永恆與魔法",d:"穿透時間幻象",g:"活在當下就是永恆",pw:"超越時間",ch:"操控"},"藍鷹":{c:"視野與創造",d:"從高處俯瞰全局",g:"先看清全貌再行動",pw:"遠見",ch:"脫離現實"},"黃戰士":{c:"智勇與提問",d:"戰士般的求知慾",g:"勇敢質疑",pw:"無畏探索",ch:"過度好鬥"},"紅地球":{c:"同步與導航",d:"與地球深刻連結",g:"跟隨生命的徵兆",pw:"共時性",ch:"執著控制"},"白鏡":{c:"真相與無盡",d:"映照事物本質",g:"接受真相",pw:"清晰洞察",ch:"過度批判"},"藍風暴":{c:"轉化與自我生成",d:"改變的催化劑",g:"擁抱變化",pw:"徹底轉化",ch:"破壞性"},"黃太陽":{c:"生命與開悟",d:"太陽般的光明",g:"讓光自然照耀",pw:"開悟之光",ch:"自我中心"}};
const MTD={"磁性":"統一吸引","月亮":"挑戰平衡","電力":"服務點亮","自我存在":"定義形式","超頻":"賦予力量","韻律":"組織平衡","共振":"連結通道","銀河":"整合完整","太陽":"意圖實現","行星":"完美顯化","光譜":"自由釋放","水晶":"合作凝聚","宇宙":"超越完成"};
function getMayan(y,m,d){const diff=Math.floor((new Date(y,m-1,d)-new Date(2006,0,14))/864e5);const k=((diff%260)+260)%260;const seal=MSL[k%20],tone=MTN[k%13];return{seal,tone,kin:k+1,d:MDS[seal],td:MTD[tone],guide:MSL[(k%20+12)%20],anti:MSL[(k%20+10)%20],occ:MSL[(k%20+18)%20]}}
const WX=["木","木","火","火","土","土","金","金","水","水"];
function getBazi(y,m,d,h,solarY,solarM,solarD){
  const sy=solarY||y,sm=solarM||m,sd=solarD||d;
  const ysi=(y-4)%10,ybi=(y-4)%12;
  /* Day stem from solar date */
  const base=Math.floor((Date.UTC(sy,sm-1,sd)-Date.UTC(1900,0,7))/864e5);
  const dsi=((base%10)+10)%10;
  /* Month stem: derived from year stem and lunar month */
  const msi=((ysi%5)*2+(m>1?m:m+12)-1)%10;
  const mbi=(m+1)%12; /* approximate month branch */
  /* Hour stem: derived from day stem and hour */
  const hIdx=Math.floor(h/2);
  const hsi=((dsi%5)*2+hIdx)%10;
  const hbi=hIdx%12;

  const dm=WX[dsi],yEl=WX[ysi],mEl=WX[msi],hEl=WX[hsi];
  /* 十神 */
  const SS=["比肩","劫財","食神","傷官","偏財","正財","七殺","正官","偏印","正印"];
  const getSS=(a,b)=>SS[((b-a)%10+10)%10];
  /* 藏干 table (simplified) */
  const HIDDEN_STEMS={
    "子":[[9,"癸"]],
    "丑":[[5,"己"],[7,"辛"],[9,"癸"]],
    "寅":[[0,"甲"],[2,"丙"],[4,"戊"]],
    "卯":[[1,"乙"]],
    "辰":[[4,"戊"],[1,"乙"],[9,"癸"]],
    "巳":[[2,"丙"],[4,"戊"],[6,"庚"]],
    "午":[[3,"丁"],[5,"己"]],
    "未":[[5,"己"],[3,"丁"],[1,"乙"]],
    "申":[[6,"庚"],[8,"壬"],[4,"戊"]],
    "酉":[[7,"辛"]],
    "戌":[[4,"戊"],[7,"辛"],[3,"丁"]],
    "亥":[[8,"壬"],[0,"甲"]]
  };
  const getHidden=(branch)=>(HIDDEN_STEMS[branch]||[]).map(([si,stem])=>({stem,el:WX[si],god:getSS(dsi,si)}));
  /* Build 4 pillars */
  const pillars=[
    {label:"年柱",stem:ST[ysi],branch:BR[ybi],stemEl:WX[ysi],branchEl:WX[(ybi+10)%12<5?(ybi%2===0?4:0):ybi<6?((ybi-2)*2)%5===0?0:2:4],stemGod:getSS(dsi,ysi),branchGod:getSS(dsi,HIDDEN_STEMS[BR[ybi]]?.[0]?.[0]||0),branchHidden:getHidden(BR[ybi])},
    {label:"月柱",stem:ST[msi],branch:BR[mbi],stemEl:WX[msi],branchEl:WX[(HIDDEN_STEMS[BR[mbi]]?.[0]?.[0]||0)],stemGod:getSS(dsi,msi),branchGod:getSS(dsi,HIDDEN_STEMS[BR[mbi]]?.[0]?.[0]||0),branchHidden:getHidden(BR[mbi])},
    {label:"日柱",stem:ST[dsi],branch:BR[((base%12)+12)%12],stemEl:dm,branchEl:WX[(HIDDEN_STEMS[BR[((base%12)+12)%12]]?.[0]?.[0]||0)],stemGod:"日主",branchGod:getSS(dsi,HIDDEN_STEMS[BR[((base%12)+12)%12]]?.[0]?.[0]||0),branchHidden:getHidden(BR[((base%12)+12)%12]),isDay:true},
    {label:"時柱",stem:ST[hsi],branch:BR[hbi],stemEl:WX[hsi],branchEl:WX[(HIDDEN_STEMS[BR[hbi]]?.[0]?.[0]||0)],stemGod:getSS(dsi,hsi),branchGod:getSS(dsi,HIDDEN_STEMS[BR[hbi]]?.[0]?.[0]||0),branchHidden:getHidden(BR[hbi])}
  ];
  /* Five element strengths */
  const wx5={木:0,火:0,土:0,金:0,水:0};
  pillars.forEach(p=>{wx5[p.stemEl]=(wx5[p.stemEl]||0)+25;p.branchHidden.forEach(h=>{wx5[h.el]=(wx5[h.el]||0)+8})});
  const total=Object.values(wx5).reduce((a,b)=>a+b,1);
  Object.keys(wx5).forEach(k=>wx5[k]=Math.round(wx5[k]/total*100));
  const weak=Object.entries(wx5).sort((a,b)=>a[1]-b[1])[0][0];
  const strong=Object.entries(wx5).sort((a,b)=>b[1]-a[1])[0][0];
  /* 大運 calculation */
  const daYun=[];
  const startAge=Math.abs(((ysi%2===0?1:-1)*(mbi*3+1))%8)+2;
  for(let i=0;i<7;i++){
    const age=startAge+i*10;
    const dySi=(msi+(ysi%2===0?i+1:-(i+1))+20)%10;
    const dyBi=(mbi+(ysi%2===0?i+1:-(i+1))+24)%12;
    const sc2=hs(dySi,dyBi,dsi,i);
    const rating=sc2>.65?5:sc2>.5?4:sc2>.35?3:sc2>.2?2:1.5;
    daYun.push({age:`${age}-${age+9}`,years:`${sy+age}-${sy+age+9}`,stem:ST[dySi],branch:BR[dyBi],el:WX[dySi],rating,si:dySi,bi:dyBi});
  }
  /* Mark current and peak */
  const curAge=new Date().getFullYear()-sy;
  daYun.forEach(d=>{const[sa]=d.age.split("-").map(Number);if(curAge>=sa&&curAge<sa+10)d.current=true});
  const peakDy=daYun.reduce((a,b)=>a.rating>b.rating?a:b);
  peakDy.peak=true;
  /* Talents + fortune (keep existing logic) */
  const ss1=getSS(dsi,ysi),ss2=getSS(dsi,msi);
  const talents=[];const ssSet=new Set([ss1,ss2]);
  if(ssSet.has("傷官"))talents.push({name:"靈動的創作者",ss:"傷官",icon:"✦",desc:"你擁有打破常規的表達力與藝術直覺。這份才華讓你在創作、設計、溝通方面有驚人的天賦。"});
  if(ssSet.has("七殺"))talents.push({name:"無畏的開創者",ss:"七殺",icon:"☩",desc:"你內在有一股不服輸的狠勁，面對困境時反而越挫越勇。"});
  if(ssSet.has("正印"))talents.push({name:"溫暖的守護者",ss:"正印",icon:"◈",desc:"你擁有海洋般的包容力，天生就是身邊人的安全港灣。"});
  if(ssSet.has("食神"))talents.push({name:"自在的享樂家",ss:"食神",icon:"❋",desc:"你天生懂得生活的美好，擁有敏銳的感官天賦。"});
  if(ssSet.has("偏財"))talents.push({name:"靈活的冒險家",ss:"偏財",icon:"✧",desc:"你擁有敏銳的商業嗅覺和冒險精神。"});
  if(ssSet.has("正官"))talents.push({name:"優雅的統率者",ss:"正官",icon:"♛",desc:"你散發著不怒自威的氣場，天生就讓人信服。"});
  if(ssSet.has("比肩"))talents.push({name:"堅毅的獨行者",ss:"比肩",icon:"▲",desc:"你擁有強大的自主意識和獨立精神。"});
  if(ssSet.has("劫財"))talents.push({name:"豪爽的行動派",ss:"劫財",icon:"◆",desc:"你果斷、慷慨、說做就做。"});
  if(ssSet.has("正財"))talents.push({name:"穩健的經營者",ss:"正財",icon:"◇",desc:"你天生具備守護和累積的能力。"});
  if(ssSet.has("偏印"))talents.push({name:"神祕的洞察者",ss:"偏印",icon:"☽",desc:"你的思維方式跟多數人不同，直覺往往精準得令人驚訝。"});
  if(talents.length===0)talents.push({name:"溫暖的守護者",ss:"正印",icon:"◈",desc:"你擁有海洋般的包容力。"});
  const cyear=new Date().getFullYear();const lysi=(cyear-4)%10;const lySS=getSS(dsi,lysi);
  const fortuneKW={"比肩":"自我突破","劫財":"果斷行動","食神":"享受當下","傷官":"創意表達","偏財":"大膽嘗試","正財":"穩健累積","七殺":"勇敢蛻變","正官":"承擔責任","偏印":"深度學習","正印":"回歸初心"}[lySS]||"蓄勢待發";
  const bodyStrength=hs(y,m,d,dsi);
  const sDesc=bodyStrength>.6?"身強——內在能量充足，適合主動出擊。":bodyStrength>.4?"中和——能量平衡，進退皆宜。":"身弱——需要外在支持，善用貴人與印星的力量。";
  /* Determine 格局 */
  const mainPattern=ssSet.has("傷官")&&(ssSet.has("正財")||ssSet.has("偏財"))?"傷官生財":ssSet.has("食神")&&(ssSet.has("正財")||ssSet.has("偏財"))?"食神生財":ssSet.has("七殺")&&ssSet.has("正印")?"殺印相生":ssSet.has("正官")?"正官格":ssSet.has("偏印")?"偏印格":"正格";
  return{yg:ST[ysi]+BR[ybi],dm,dmEl:dm,dsi,ysi,yEl,msi,mEl,hsi,hEl,pillars,wx5,weak,strong,talents:talents.slice(0,3),fortuneKW,lySS,s:bodyStrength,sDesc,daYun,mainPattern,getSS,lysi}
}
const MJ={"紫微":{b:30},"天機":{b:18},"太陽":{b:25},"武曲":{b:22},"天同":{b:16},"廉貞":{b:15},"天府":{b:28},"太陰":{b:24},"貪狼":{b:14},"巨門":{b:12},"天相":{b:20},"天梁":{b:22},"七殺":{b:10},"破軍":{b:8}};
const LST={"左輔":8,"右弼":8,"文昌":7,"文曲":7,"天魁":10,"天鉞":10};
const UST={"擎羊":-12,"陀羅":-10,"火星":-13,"鈴星":-11,"地空":-15,"地劫":-14};
const SHV={"化祿":20,"化權":18,"化科":15,"化忌":-20};
const BTM={"廟":1.2,"旺":1.0,"得":0.85,"利":0.7,"平":0.5,"不":0.3,"陷":0.1};
const SHT=[["廉貞","破軍","武曲","太陽"],["天機","天梁","紫微","太陰"],["天同","天機","文昌","廉貞"],["太陰","天同","天機","巨門"],["貪狼","太陰","右弼","天機"],["武曲","貪狼","天梁","文曲"],["太陽","武曲","太陰","天同"],["巨門","太陽","文曲","文昌"],["天梁","紫微","左輔","武曲"],["破軍","巨門","太陰","貪狼"]];
function gWJ(si,bi){const t=[[2,6,5,3,4],[6,5,3,4,2],[5,3,4,2,6],[3,4,2,6,5],[4,2,6,5,3]];return{name:{2:"水二局",3:"木三局",4:"金四局",5:"土五局",6:"火六局"}[t[si%5]?.[Math.floor(bi/2)%5]||2],value:t[si%5]?.[Math.floor(bi/2)%5]||2}}
function gLP2(lm,sc){return(14-sc+lm-1)%12}
function gZP(ld,jv){let q=Math.ceil(ld/jv),r=ld%jv;if(r===0)return(2+q-1)%12;return(((q%2===0?(2+q+r-1):(2+q-r+jv-1))%12)+12)%12}
function genChart(bY,bM,bD,bH,isLunar){
  const lu=isLunar?{year:bY,month:bM,day:bD}:s2l(bY,bM,bD),sc=getSC(bH),ysi=(lu.year-4)%10,ybi=(lu.year-4)%12;
  const lpp=gLP2(lu.month,sc),psi=((ysi%5)*2+2+lpp-2+20)%10;
  const ju=gWJ(psi,lpp),zwp=gZP(lu.day,ju.value);
  const P=[];for(let i=0;i<12;i++){const pi=(lpp-i+12)%12;P.push({name:PN[i],branch:BR[pi],bi:pi,stars:[],ls:[],us:[],sh:[],bt:{}})}
  const brs=["廟","旺","得"];
  Object.entries({"紫微":0,"天機":-1,"太陽":-3,"武曲":-4,"天同":-5,"廉貞":-8}).forEach(([s,o])=>{const pos=((zwp+o)%12+12)%12;const p=P.find(p=>p.bi===pos);if(p){p.stars.push(s);p.bt[s]=brs[Math.min(Math.abs(o)%3,2)]}});
  const tfp=(4-zwp+12)%12;
  Object.entries({"天府":0,"太陰":1,"貪狼":2,"巨門":3,"天相":4,"天梁":5,"七殺":6,"破軍":10}).forEach(([s,o])=>{const pos=((tfp+o)%12+12)%12;const p=P.find(p=>p.bi===pos);if(p){p.stars.push(s);p.bt[s]=brs[o%3]}});
  Object.entries({"文昌":(10-sc+12)%12,"文曲":(sc+4)%12,"左輔":(4+lu.month-1)%12,"右弼":(10-lu.month+1+12)%12,"天魁":[1,0,3,3,1,0,7,2,3,3][ysi],"天鉞":[7,8,5,5,7,8,1,6,5,5][ysi]}).forEach(([s,pos])=>{const p=P.find(p=>p.bi===pos);if(p)p.ls.push(s)});
  Object.entries({"擎羊":(ysi+3)%12,"陀羅":(ysi+1)%12,"火星":(2+sc+ybi)%12,"鈴星":(10+sc+ybi)%12,"地空":(11-sc+12)%12,"地劫":(sc+11)%12}).forEach(([s,pos])=>{const p=P.find(p=>p.bi===pos);if(p)p.us.push(s)});
  SHT[ysi].forEach((star,idx)=>{const shn=["化祿","化權","化科","化忌"];P.forEach(p=>{if(p.stars.includes(star)||p.ls.includes(star))p.sh.push({name:shn[idx],star})})});
  const solarBY=isLunar?l2s(bY,bM,bD).year:bY;
  return{P,lu,sc,ysi,ybi,lpp,bpp:(lpp+sc)%12,zwp,ju,yg:ST[ysi]+BR[ybi],bY:solarBY}
}
function scoreP(p){let b=0,bo=0,pe=0;p.stars.forEach(s=>{const d=MJ[s];if(d){const m=BTM[p.bt[s]||"平"]||0.5;b+=d.b*m;bo+=d.b*.25}});p.ls.forEach(s=>{b+=(LST[s]||0);bo+=(LST[s]||0)*.4});p.us.forEach(s=>{b+=(UST[s]||0);pe+=Math.abs(UST[s]||0)*.4});p.sh.forEach(x=>{const v=SHV[x.name]||0;b+=v;if(v>0)bo+=v*.25;else pe+=Math.abs(v)*.25});const n=v=>Math.max(2,Math.min(98,Math.round((v-15)*45/55+50)));const op=n(b-bo),cl=n(b);return{open:op,close:cl,high:Math.max(op,cl,n(b+bo)),low:Math.min(op,cl,n(b-pe))}}
function dimP(ch,d){switch(d){case"總運":return[ch.P[0],ch.P.find(p=>p.bi===ch.bpp),ch.P[10]].filter(Boolean);case"財運":return[ch.P[4],ch.P[10]];case"健康":return[ch.P[5]];case"感情":return[ch.P[2]];default:return[ch.P[0]]}}
function avgB(ch,d){const bs=dimP(ch,d).map(scoreP);return Math.round(bs.reduce((s,b)=>s+b.close,0)/bs.length)}
// K-line data
const luD={"廉貞":"事業桃花雙收","天機":"直覺很準","太陽":"貴人相助","武曲":"正財爆棚","天同":"人緣極佳","太陰":"偏財運好","貪狼":"魅力拉滿","巨門":"口才出眾","天梁":"逢凶化吉","破軍":"先破後立","天相":"考試簽約順","七殺":"拼搏有回報","紫微":"格局打開","左輔":"有人相助","右弼":"暗中得力","文昌":"考運超強","文曲":"藝術爆發"};
const jiD={"太陽":"注意長輩關係","武曲":"財務要小心","天同":"情緒要穩住","廉貞":"感情是非避開","太陰":"小心被騙","天機":"別想太多","巨門":"管住嘴","文曲":"別信花言巧語","文昌":"文件要查","天梁":"健康注意","紫微":"別太固執","破軍":"別衝動","貪狼":"桃花是非","天相":"合約小心","左輔":"信錯人","右弼":"小人暗算"};
function genLife(ch,dim){const ab=avgB(ch,dim),ds=["總運","財運","健康","感情"].indexOf(dim),data=[],eA=85;const dxL=[];let di=0;for(let a=ch.ju.value;a<eA;a+=10){dxL.push({sa:a,ea:Math.min(a+9,eA),idx:di});di++}let prev=ab,pk=0,pi=-1;for(let age=1;age<=eA;age++){const yr=ch.bY+age,ysi=(yr-4)%10,ybi=(yr-4)%12,dx=dxL.find(d=>age>=d.sa&&age<=d.ea);const h1=hs(ch.ysi,ysi,age,ds),h2=hs(ybi,ch.zwp,dx?.idx||0,ds+7),h3=hs(age,ch.lpp,ds,ysi+3),h4=hs(age+ds,ysi+3,ch.ybi,ch.zwp+ds);const dxPh=dx?((age-dx.sa)/10):.5;const w=Math.sin(dxPh*Math.PI)*14-4+(age<18?-6:age<25?4:age<50?Math.sin((age-25)/25*Math.PI)*10:-3-(age-50)*.15)+(h1-.5)*50*0.55+(h2-.5)*34*0.55+(dx?(Math.sin((dx.idx*3.7+ds*1.3))*18+(h4-.5)*16)*.65:0)+(ab-50)*.2;let cl=prev*.15+(48+w)*.85;cl=Math.max(3,Math.min(98,cl));const vol=1.5+h4*5,op=prev*.5+cl*.5+(h2-.5)*8;const c={age,year:yr,yl:`${ST[ysi]}${BR[ybi]}`,open:Math.max(0,Math.min(100,Math.round(op))),close:Math.max(0,Math.min(100,Math.round(cl))),high:Math.max(0,Math.min(100,Math.round(Math.max(op,cl)+vol*(.5+h1*.5)))),low:Math.max(0,Math.min(100,Math.round(Math.min(op,cl)-vol*(.5+h2*.5)))),fst:dx?age===dx.sa:false};c.high=Math.max(c.open,c.close,c.high);c.low=Math.min(c.open,c.close,c.low);const sh=SHT[((yr-4)%10+10)%10],gr=c.close>=75?"S":c.close>=58?"A":c.close>=42?"B":c.close>=25?"C":"D";const oT={S:["運勢極佳！","高光年份！"],A:["運勢不錯。","好運多。"],B:["運勢平穩。","中規中矩。"],C:["運勢偏弱。","需要耐心。"],D:["低谷期。","保存實力。"]};const aT={S:["大膽追夢！","機不可失！"],A:["穩步前進。","適度冒險。"],B:["投資自己。","穩住心態。"],C:["少折騰。","找人聊聊。"],D:["保存體力。","照顧自己。"]};const seed=hs(yr,ysi,ds,c.close);c.comment=`${oT[gr][Math.floor(seed*2)]}${sh[0]}化祿—${luD[sh[0]]||"好運"}。${sh[3]}化忌—${jiD[sh[3]]||"留心"}。${aT[gr][Math.floor(seed*2)]}`;data.push(c);if(c.close>pk){pk=c.close;pi=data.length-1}prev=c.close}if(pi>=0)data[pi].isPeak=true;return{data,pi,pk}}
function genSimp(ch,dim,mode){const ab=avgB(ch,dim),ds=["總運","財運","健康","感情"].indexOf(dim),cy=new Date().getFullYear();const items=mode==="流年"?Array.from({length:12},(_,i)=>{const yr=cy-5+i,ysi=((yr-4)%10+10)%10,ybi=((yr-4)%12+12)%12;return{l:`${yr}`,s:yr,year:yr,yl:`${ST[ysi]}${BR[ybi]}`}}):Array.from({length:12},(_,i)=>({l:`${i+1}月`,s:i+1,month:i+1}));const data=[];let prev=ab;items.forEach(it=>{const h=hs(ch.ysi,it.s,ds,ch.zwp),h2=hs(it.s,ch.lpp,ds+5,ch.ybi);let cl=prev*.25+(50+(ab-50)*.25+(h-.5)*40+(h2-.5)*24)*.75;cl=Math.max(5,Math.min(95,cl));const vol=1+h2*4,op=prev*.45+cl*.55+(h-.5)*5;const c={label:it.l,open:Math.max(0,Math.min(100,Math.round(op))),close:Math.max(0,Math.min(100,Math.round(cl))),high:Math.max(0,Math.min(100,Math.round(Math.max(op,cl)+vol))),low:Math.max(0,Math.min(100,Math.round(Math.min(op,cl)-vol))),comment:"",year:it.year,yl:it.yl};c.high=Math.max(c.open,c.close,c.high);c.low=Math.min(c.open,c.close,c.low);if(it.year){const sh=SHT[((it.year-4)%10+10)%10];c.comment=`${sh[0]}化祿帶來好運，${sh[3]}化忌要留心。`;c.sh=sh}else if(it.month){const sh=SHT[(ch.ysi*2+2+it.month-1)%10];c.comment=`${sh[0]}化祿加持，${sh[3]}化忌注意。`;c.sh=sh}data.push(c);prev=cl});return data}

// ═══════════════════════════════════════
// FORTUNE STICKS (行天宮籤詩)
// ═══════════════════════════════════════
const POEMS=[
  {n:1,r:"上上",p:"日出便見風雲散\n光明清淨照世間\n一向前途通大道\n萬事清吉保平安",e:"你的困惑就像清晨薄霧，太陽一出就會散去。前方的路是通暢的，放心往前走，一切都會好的。"},
  {n:3,r:"上",p:"衣食自然生處有\n勸君不用苦勞心\n但能孝悌存忠信\n福祿來成禍不侵",e:"你需要的一切早已被安排好。與其焦慮，不如好好對待身邊的人。善良和真誠就是你最強的護身符。"},
  {n:7,r:"上",p:"奇奇奇出人意外\n事事事在人胸懷\n寬得志時方得志\n長將勤儉記心裁",e:"會有超乎預期的好事發生！但記得保持謙虛勤儉，好運才會持續得更久。"},
  {n:11,r:"中",p:"急水灘頭放船歸\n風波作浪欲何為\n若要安然求穩靜\n等待時光不用催",e:"現在不適合急躁行動。暫時放下執著，等待更好的時機。有時「不動」就是最好的選擇。"},
  {n:19,r:"中上",p:"大雨淋漓遍地流\n行人盡道不宜秋\n忽然一陣雲開處\n天邊依舊掛明鉤",e:"你正經歷一段難熬的時光，但暴雨過後必有晴天。困境很快就會過去，堅持住，轉機就在眼前！"},
  {n:23,r:"上",p:"時來運轉喜重重\n在處營求百事宜\n一切謀為皆上吉\n前途大有好佳期",e:"轉運時刻到了！無論事業還是感情，都有好消息在路上。大膽做計畫吧！"},
  {n:31,r:"上上",p:"松柏茂盛正當時\n慎勿因循苟且遲\n若能把握今朝事\n功成名就在天涯",e:"你正處於最好的狀態！此刻就是最佳行動時機，不要拖延猶豫，勇敢去做你一直想做的事！"},
  {n:35,r:"中上",p:"花開花謝在春風\n貧富窮通總不同\n蝴蝶雙飛翩翩舞\n人間何事不相逢",e:"你即將迎來一段重要的緣分，可能是愛情也可能是貴人。保持開放的心態。"},
  {n:42,r:"中",p:"有心作福莫遲疑\n禱告虔誠保佑之\n坐守舊業能安穩\n休戀他鄉有是非",e:"現在不適合大幅改變。守住現有基礎，踏實做好手邊的事。外面的誘惑可能帶來不必要的麻煩。"},
  {n:51,r:"中下",p:"夏日炎天日正長\n人人愁熱悶心腸\n天寒豈是無衣者\n也有棉袍絮滿箱",e:"雖然現在不太舒服，但你的資源比你想像的更多。仔細盤點，底牌其實不錯。"},
  {n:66,r:"上",p:"一生利祿自安排\n須教言行莫虧虛\n富貴功名天賜與\n悠悠歲月樂無涯",e:"之前的努力即將迎來回報。命運已在暗中安排好一切，好消息在路上！"},
  {n:77,r:"下",p:"門庭衰敗實堪悲\n大廈將傾莫挽支\n合力齊心方有望\n若還獨立總成虧",e:"目前的困境靠一個人很難撐過去。放下面子，向信任的人求助。團結合作才是走出困境的關鍵。"},
];

// ═══════════════════════════════════════
// SOUL SYNTHESIS
// ═══════════════════════════════════════
function synthesize(zodiac,lp,hd,mayan,bazi,ziwei){
  const zt=ZT[zodiac]||ZT["牡羊座"];
  const lpd=LPD[lp]||LPD[1];
  const gifts=[...new Set([...(zt.tr||[]).slice(0,2),...(lpd.g||[]).slice(0,2)])].slice(0,5);
  return{
    giftText:`你的靈魂天賦是「${gifts.join("、")}」。${zodiac}的${zt.en}能量與生命靈數${lp}號「${lpd.t}」的特質在你身上融合——你天生就不是平凡的靈魂。`,
    hdText:`從人類圖來看，你是「${hd.type}」（佔全球人口${hd.pct}），人生策略是「${hd.st}」。${hd.desc}`,
    mayanText:`瑪雅星系印記顯示你是「${mayan.tone} ${mayan.seal}」（第${mayan.kin}個Kin）。你的本質是${mayan.d?.d||mayan.seal}。`,
    baziText:`八字日主為「${bazi.dm}」——${bazi.desc}`,
    shadow:`你的靈魂課題：${zt.sh}。這不是缺點，而是此生的修煉功課。擁抱它，它會成為你最大的力量。`,
    cosmic:`最近宇宙想對你說：放鬆一點，你已經做得夠好了。不要用別人的時間表來衡量自己，你有你自己的完美節奏。`,
    gifts,zodiac:zt,lpd
  }
}

// ═══════════════════════════════════════
// THEME & COMPONENTS
// ═══════════════════════════════════════
const C={bg:"#0c0c1a",bg2:"rgba(20,18,40,0.7)",gold:"#d4a574",rose:"#e0a0b8",purp:"#8b7ec8",blue:"#5a7fb5",txt:"#e8e4de",txt2:"#9a9490",bdr:"rgba(200,180,160,0.1)"};

function Stars(){
  const r=useRef(null);
  useEffect(()=>{const cv=r.current;if(!cv)return;const ctx=cv.getContext("2d");cv.width=window.innerWidth;cv.height=window.innerHeight;const ss=Array.from({length:100},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.3+.3,a:Math.random(),s:Math.random()*.004+.001}));let f;const d=()=>{ctx.clearRect(0,0,cv.width,cv.height);ss.forEach(s=>{s.a+=s.s;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(212,165,116,${.2+Math.sin(s.a)*.3})`;ctx.fill()});f=requestAnimationFrame(d)};d();return()=>cancelAnimationFrame(f)},[]);
  return <canvas ref={r} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:.5}}/>;
}

function Glass({children,style,...p}){
  return <div style={{background:"rgba(25,22,50,0.55)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:16,border:`1px solid ${C.bdr}`,padding:24,boxShadow:"0 8px 32px rgba(0,0,0,.3)",position:"relative",...style}} {...p}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.gold}33,transparent)`}}/>
    {children}
  </div>;
}

// K-Line Chart (Mystical theme)
function KChart({data,w,h,isLife}){
  const cv=useRef(null),cr=useRef(null);const[tip,setTip]=useState(null);
  useEffect(()=>{
    const c=cv.current;if(!c||!data?.length)return;const ctx=c.getContext("2d");const dpr=window.devicePixelRatio||2;
    c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);
    const UP=C.gold,DN="#7b6baa",TX="rgba(200,190,180,.4)";
    const pad={top:isLife?28:22,right:14,bottom:isLife?38:36,left:42};
    const cW=w-pad.left-pad.right,cH=h-pad.top-pad.bottom;
    ctx.clearRect(0,0,w,h);const grd=ctx.createLinearGradient(0,0,0,h);grd.addColorStop(0,"rgba(15,12,30,.9)");grd.addColorStop(1,"rgba(8,8,20,.95)");ctx.fillStyle=grd;ctx.fillRect(pad.left,pad.top,cW,cH);
    const toY=v=>pad.top+cH*(1-v/100),gap=cW/data.length;
    const cWid=isLife?Math.max(2,Math.min(6,gap*.6)):Math.max(10,Math.min(36,gap*.7));
    for(let v=0;v<=100;v+=25){const y=toY(v);ctx.strokeStyle="rgba(200,180,160,.06)";ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+cW,y);ctx.stroke();ctx.fillStyle=TX;ctx.font="10px sans-serif";ctx.textAlign="right";ctx.fillText(v+"",pad.left-6,y+3)}
    if(isLife){data.forEach((d,i)=>{if(d.age%10===0){const x=pad.left+gap*i+gap/2;ctx.fillStyle=TX;ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(d.age+"歲",x,h-pad.bottom+14)}if(d.fst&&i>0){const x=pad.left+gap*i;ctx.strokeStyle="rgba(212,165,116,.08)";ctx.lineWidth=.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x,pad.top);ctx.lineTo(x,pad.top+cH);ctx.stroke();ctx.setLineDash([])}})}else{data.forEach((d,i)=>{const x=pad.left+gap*i+gap/2;ctx.fillStyle=TX;ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(d.label,x,h-pad.bottom+15)})}
    data.forEach((d,i)=>{const x=pad.left+gap*i+gap/2,up=d.close>=d.open,col=up?UP:DN;ctx.strokeStyle=col;ctx.lineWidth=isLife?.8:1.2;ctx.beginPath();ctx.moveTo(x,toY(d.high));ctx.lineTo(x,toY(d.low));ctx.stroke();const bT=toY(Math.max(d.open,d.close)),bB=toY(Math.min(d.open,d.close));ctx.fillStyle=col;ctx.fillRect(x-cWid/2,bT,cWid,Math.max(isLife?1:2,bB-bT))});
    // MA
    const mp=isLife?10:5;if(data.length>=mp){ctx.strokeStyle=`${C.rose}55`;ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.beginPath();let s=false;for(let i=mp-1;i<data.length;i++){let sm=0;for(let j=0;j<mp;j++)sm+=data[i-j].close;const x=pad.left+gap*i+gap/2;if(!s){ctx.moveTo(x,toY(sm/mp));s=true}else ctx.lineTo(x,toY(sm/mp))}ctx.stroke();ctx.setLineDash([])}
    // Peak
    if(isLife){const pi=data.findIndex(d=>d.isPeak);if(pi>=0){const x=pad.left+gap*pi+gap/2;ctx.fillStyle=C.gold;ctx.font="bold 12px serif";ctx.textAlign="center";ctx.fillText("★",x,toY(data[pi].high)-8)}}
  },[data,w,h,isLife]);
  const onMM=useCallback(e=>{if(!data?.length)return;const rect=cv.current?.getBoundingClientRect();if(!rect)return;const x=e.clientX-rect.left,cW=w-56,g=cW/data.length,idx=Math.floor((x-42)/g);if(idx>=0&&idx<data.length){const rc=cr.current?.getBoundingClientRect();setTip({...data[idx],mx:e.clientX-(rc?.left||0),my:e.clientY-(rc?.top||0)})}else setTip(null)},[data,w]);
  return(<div ref={cr} style={{position:"relative"}} onMouseLeave={()=>setTip(null)}>
    <canvas ref={cv} style={{width:w,height:h,display:"block",cursor:"crosshair",borderRadius:8}} onMouseMove={onMM}/>
    {tip&&<div style={{position:"absolute",left:Math.min(tip.mx+14,w-290),top:Math.max(tip.my-120,8),background:"rgba(20,18,40,.95)",border:`1px solid ${C.bdr}`,borderRadius:10,padding:"10px 14px",fontSize:".74rem",color:C.txt,pointerEvents:"none",boxShadow:"0 6px 24px rgba(0,0,0,.4)",zIndex:10,lineHeight:1.65,width:tip.comment?280:"auto",minWidth:130,backdropFilter:"blur(12px)"}}>
      <div style={{fontWeight:700,fontSize:".82rem",marginBottom:3,display:"flex",justifyContent:"space-between"}}>
        <span>{tip.year?`${tip.year}年（${tip.yl}）· ${tip.age}歲`:tip.label}{tip.yl&&!tip.age?`（${tip.yl}）`:""}</span>
        <span style={{color:tip.close>=60?C.gold:tip.close>=40?C.txt2:"#b07080",fontWeight:900}}>{tip.close}分</span>
      </div>
      {tip.sh&&<div style={{fontSize:".64rem",color:C.txt2,marginBottom:4,padding:"2px 5px",background:"rgba(255,255,255,.03)",borderRadius:3}}>四化：<span style={{color:C.gold}}>{tip.sh[0]}祿</span> · <span style={{color:C.rose}}>{tip.sh[1]}權</span> · <span style={{color:C.blue}}>{tip.sh[2]}科</span> · <span style={{color:"#b07080"}}>{tip.sh[3]}忌</span></div>}
      <div style={{display:"flex",gap:8,fontSize:".66rem",color:C.txt2,marginBottom:tip.comment?5:0,borderBottom:tip.comment?`1px solid ${C.bdr}`:"none",paddingBottom:tip.comment?5:0}}>
        <span>開{tip.open}</span><span>收{tip.close}</span><span>高{tip.high}</span><span>低{tip.low}</span>
      </div>
      {tip.comment&&<div style={{fontSize:".72rem",lineHeight:1.7,color:tip.close>=60?C.gold:tip.close>=40?C.txt:"#c08090"}}>{tip.comment}</div>}
    </div>}
  </div>);
}

// Radar Chart for traits
function Radar({labels,values,size}){
  const cv=useRef(null);
  useEffect(()=>{const c=cv.current;if(!c)return;const ctx=c.getContext("2d");const dpr=window.devicePixelRatio||2;c.width=size*dpr;c.height=size*dpr;ctx.scale(dpr,dpr);const cx=size/2,cy=size/2,r=size/2-30,n=labels.length;ctx.clearRect(0,0,size,size);
    // Grid
    for(let ring=1;ring<=4;ring++){ctx.beginPath();for(let i=0;i<=n;i++){const a=-Math.PI/2+i*2*Math.PI/n;const rr=r*ring/4;ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}ctx.closePath();ctx.strokeStyle=`rgba(212,165,116,${ring===4?.12:.06})`;ctx.lineWidth=.5;ctx.stroke()}
    // Data fill
    ctx.beginPath();values.forEach((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const rr=r*v/100;const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.closePath();const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,r);grd.addColorStop(0,"rgba(212,165,116,.25)");grd.addColorStop(1,"rgba(224,160,184,.1)");ctx.fillStyle=grd;ctx.fill();ctx.strokeStyle=`${C.gold}88`;ctx.lineWidth=1.5;ctx.stroke();
    // Labels
    labels.forEach((l,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const x=cx+Math.cos(a)*(r+16),y=cy+Math.sin(a)*(r+16);ctx.fillStyle=C.txt2;ctx.font="11px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(l,x,y)})
  },[labels,values,size]);
  return <canvas ref={cv} style={{width:size,height:size}}/>;
}

// ═══════════════════════════════════════
// PHYSICS JIAOBEI TOSS
// ═══════════════════════════════════════
function JiaobeiPhysics(){
  const cv=useRef(null);
  useEffect(()=>{
    const c=cv.current;if(!c)return;
    const ctx=c.getContext("2d");
    const W=280,H=220,dpr=window.devicePixelRatio||2;
    c.width=W*dpr;c.height=H*dpr;ctx.scale(dpr,dpr);
    const G=0.38,FLOOR=H-35,BOUNCE=0.45,FRICTION=0.92;
    const pieces=[
      {x:W/2-30,y:FLOOR,vx:-1.2-Math.random(),vy:-9.5-Math.random()*2,rot:0,vr:5+Math.random()*4,settled:0},
      {x:W/2+30,y:FLOOR,vx:1.0+Math.random(),vy:-10-Math.random()*2,rot:0,vr:-4.5-Math.random()*4,settled:0}
    ];
    const drawJiao=(x,y,rot,scale)=>{
      ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);
      ctx.beginPath();ctx.ellipse(0,-3,22,14,0,Math.PI,0,false);
      ctx.lineTo(22,0);ctx.lineTo(22,4);ctx.quadraticCurveTo(0,6,-22,4);ctx.lineTo(-22,0);ctx.closePath();
      const grd=ctx.createLinearGradient(0,-14,0,6);
      grd.addColorStop(0,"#d4a050");grd.addColorStop(0.4,"#b07818");grd.addColorStop(0.7,"#8b6914");grd.addColorStop(1,"#654a0e");
      ctx.fillStyle=grd;ctx.fill();
      ctx.strokeStyle="rgba(160,120,24,.6)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.strokeStyle="rgba(255,220,150,.08)";ctx.lineWidth=0.5;
      for(let i=-15;i<16;i+=6){ctx.beginPath();ctx.moveTo(i,-10);ctx.quadraticCurveTo(i+2,-2,i,4);ctx.stroke()}
      ctx.beginPath();ctx.ellipse(0,-6,14,6,0,Math.PI+0.3,Math.PI*2-0.3,false);
      ctx.strokeStyle="rgba(255,230,170,.15)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.restore();
    };
    const drawShadow=(x,height)=>{
      const s=Math.max(0.2,1-height/120);
      ctx.save();ctx.translate(x,FLOOR+6);ctx.scale(1,0.3);
      ctx.beginPath();ctx.arc(0,0,18*s,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,0,0,${0.15*s})`;ctx.fill();ctx.restore();
    };
    let frame;
    const loop=()=>{
      ctx.clearRect(0,0,W,H);
      ctx.strokeStyle="rgba(212,165,116,.08)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(30,FLOOR+8);ctx.lineTo(W-30,FLOOR+8);ctx.stroke();
      ctx.fillStyle="rgba(200,190,180,.35)";ctx.font="12px 'Noto Serif SC',serif";ctx.textAlign="center";
      ctx.fillText("擲筊中，請虔誠等待...",W/2,H-6);
      pieces.forEach(p=>{
        if(p.settled<80){
          p.vy+=G;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr*0.04;
          if(p.y>=FLOOR){
            p.y=FLOOR;
            if(Math.abs(p.vy)>1.2){
              p.vy*=-BOUNCE*(0.5+Math.random()*0.35);
              p.vx*=FRICTION;p.vr*=0.55;
            }else{p.vy=0;p.vx*=0.82;p.vr*=0.85;p.settled++}
          }
          if(p.x<30){p.x=30;p.vx=Math.abs(p.vx)*0.4}
          if(p.x>W-30){p.x=W-30;p.vx=-Math.abs(p.vx)*0.4}
        }else if(p.settled<150){
          p.settled++;p.vr*=0.93;p.rot+=p.vr*0.015;
        }else if(p.settled===150){
          p.y=FLOOR;p.vy=-8.5-Math.random()*3.5;
          p.vx=(p.x<W/2?-1:1)*(0.6+Math.random()*0.8);
          p.vr=(Math.random()-.5)*9;p.settled=0;
        }
        const height=Math.max(0,FLOOR-p.y);
        drawShadow(p.x,height);drawJiao(p.x,p.y,p.rot,0.9+height*0.001);
      });
      frame=requestAnimationFrame(loop);
    };
    loop();return()=>cancelAnimationFrame(frame);
  },[]);
  return <div style={{textAlign:"center",padding:"16px 0"}}><canvas ref={cv} style={{width:280,height:220,display:"block",margin:"0 auto"}}/></div>;
}

// ═══════════════════════════════════════
// FORTUNE STICK (擲筊) COMPONENT
// ═══════════════════════════════════════
function Jiaobei(){
  const[phase,setPhase]=useState("ask"); // ask,throwing,jresult,shaking,rising,result
  const[question,setQuestion]=useState("");
  const[throws,setThrows]=useState(0);
  const[result,setResult]=useState(null);
  const[jRes,setJRes]=useState("");
  const stickRef=useRef(null);

  const doThrow=()=>{
    if(!question.trim())return;
    setJRes("");setPhase("throwing");
    setTimeout(()=>{
      const r=Math.random();
      let res;if(r<0.45)res="聖筊";else if(r<0.72)res="笑筊";else res="陰筊";
      setJRes(res);setThrows(t=>t+1);setPhase("jresult");
      if(res==="聖筊"){
        setTimeout(()=>{
          setPhase("shaking");
          setTimeout(()=>{
            const poem=POEMS[Math.floor(Math.random()*POEMS.length)];
            setResult(poem);
            setTimeout(()=>{
              setPhase("rising");
              setTimeout(()=>setPhase("result"),2500);
            },50);
          },3000);
        },1800);
      }
    },3000);
  };

  // ── RESULT ──
  if(phase==="result"&&result){
    return(<div style={{animation:"fadeUp .8s ease-out"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:"2.5rem",marginBottom:8,animation:"glow 2s ease-in-out infinite"}}>🏮</div>
        <div style={{fontSize:".9rem",color:C.gold,letterSpacing:".2em",fontWeight:700}}>第 {result.n} 籤</div>
        <div style={{fontSize:".72rem",color:C.txt2,marginTop:2}}>{result.r}</div>
      </div>
      <div style={{textAlign:"center",padding:"24px 20px",background:`linear-gradient(135deg,${C.gold}08,${C.rose}06)`,borderRadius:14,border:`1px solid ${C.gold}22`,marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.gold}44,transparent)`}}/>
        <div style={{whiteSpace:"pre-line",fontFamily:"'Noto Serif SC',serif",fontSize:"1rem",lineHeight:2.4,color:C.gold,letterSpacing:".1em"}}>{result.p}</div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.gold}44,transparent)`}}/>
      </div>
      <div style={{fontSize:".84rem",lineHeight:2,color:C.txt,padding:"18px 20px",background:"rgba(255,255,255,.02)",borderRadius:12,border:`1px solid ${C.bdr}`}}>
        <div style={{fontWeight:700,color:C.rose,marginBottom:8,fontSize:".76rem",letterSpacing:".12em"}}>✦ 白話解籤</div>
        {result.e}
      </div>
      <button onClick={()=>{setPhase("ask");setResult(null);setThrows(0);setQuestion("");setJRes("")}} style={{display:"block",margin:"20px auto 0",padding:"10px 28px",background:"transparent",color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:24,fontSize:".8rem",cursor:"pointer",fontFamily:"inherit",letterSpacing:".08em"}}>再求一籤</button>
    </div>);
  }

  // ── SHAKING STICKS ANIMATION ──
  if(phase==="shaking"){
    return(<div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:".82rem",color:C.gold,marginBottom:16,letterSpacing:".12em",animation:"fadeUp .4s ease-out"}}>神明允筊，正在搖籤筒...</div>
      <div style={{position:"relative",width:120,height:200,margin:"0 auto"}}>
        {/* Bamboo tube */}
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:70,height:140,borderRadius:"8px 8px 35px 35px",background:"linear-gradient(180deg,#8b6914,#654a0e,#4a3508)",border:"2px solid #a07818",boxShadow:"inset 0 0 20px rgba(0,0,0,.4),0 4px 20px rgba(0,0,0,.3)",animation:"tubeshake .15s ease-in-out infinite alternate",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:"30%",width:"8%",height:"100%",background:"rgba(255,255,255,.06)"}}/>
        </div>
        {/* Sticks poking out */}
        {Array.from({length:8}).map((_,i)=>{
          const angle=-20+i*5.5;const delay=i*0.05;
          return <div key={i} style={{position:"absolute",bottom:80,left:"50%",width:3,height:90,background:`linear-gradient(180deg,${C.gold},#a07818)`,borderRadius:"1.5px 1.5px 0 0",transformOrigin:"bottom center",transform:`translateX(-50%) rotate(${angle}deg)`,animation:`stickshake .12s ${delay}s ease-in-out infinite alternate`,boxShadow:"0 0 3px rgba(212,165,116,.3)"}}/>;
        })}
      </div>
      <div style={{marginTop:16,display:"flex",justifyContent:"center",gap:4}}>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:3,background:C.gold,opacity:.4,animation:`dotpulse 1s ${i*.3}s ease-in-out infinite`}}/>)}
      </div>
    </div>);
  }

  // ── STICK RISING OUT ──
  if(phase==="rising"&&result){
    return(<div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:".82rem",color:C.gold,marginBottom:16,letterSpacing:".12em"}}>一支籤跳了出來！</div>
      <div style={{position:"relative",width:120,height:240,margin:"0 auto"}}>
        {/* Tube */}
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:70,height:140,borderRadius:"8px 8px 35px 35px",background:"linear-gradient(180deg,#8b6914,#654a0e,#4a3508)",border:"2px solid #a07818",boxShadow:"inset 0 0 20px rgba(0,0,0,.4)",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:"30%",width:"8%",height:"100%",background:"rgba(255,255,255,.06)"}}/>
        </div>
        {/* The chosen stick rising */}
        <div style={{position:"absolute",bottom:60,left:"50%",transform:"translateX(-50%)",width:8,height:160,background:`linear-gradient(180deg,${C.gold},#c4943c,#a07818)`,borderRadius:4,animation:"stickrise 2s ease-out forwards",boxShadow:`0 0 16px ${C.gold}66`,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:12}}>
          <span style={{writingMode:"vertical-rl",fontSize:".7rem",color:"#3a2a10",fontWeight:700,letterSpacing:".1em"}}>{result.n}</span>
        </div>
        {/* Glow */}
        <div style={{position:"absolute",bottom:100,left:"50%",transform:"translateX(-50%)",width:60,height:60,borderRadius:"50%",background:`radial-gradient(circle,${C.gold}22,transparent 70%)`,animation:"glow 1.5s ease-in-out infinite"}}/>
      </div>
      <div style={{marginTop:16,fontSize:"1.2rem",fontWeight:900,color:C.gold,animation:"fadeUp 1.5s ease-out"}}>第 {result.n} 籤</div>
    </div>);
  }

  // ── THROWING JIAOBEI ANIMATION ──
  if(phase==="throwing"){
    return <JiaobeiPhysics/>;
  }

  // ── JIAOBEI RESULT (before shaking) ──
  if(phase==="jresult"&&jRes){
    const isSh=jRes==="聖筊";
    return(<div style={{textAlign:"center",padding:"30px 0",animation:"fadeUp .4s ease-out"}}>
      <div style={{fontSize:"3rem",marginBottom:12,animation:"glow 1.5s ease-in-out infinite"}}>{isSh?"🎊":jRes==="笑筊"?"😊":"🌑"}</div>
      <div style={{fontSize:"1.2rem",fontWeight:700,color:isSh?C.gold:C.txt2,letterSpacing:".15em",marginBottom:8}}>{jRes}！</div>
      <div style={{fontSize:".82rem",color:C.txt2,lineHeight:1.8}}>{isSh?"神明允筊！即將為你搖籤...":jRes==="笑筊"?"神明笑而不答，請沉澱心思再試一次":"兩面都是陰面，再靜心感受一下"}</div>
      {!isSh&&<button onClick={()=>{setPhase("ask");setJRes("")}} style={{marginTop:16,padding:"10px 28px",background:"transparent",color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:24,fontSize:".8rem",cursor:"pointer",fontFamily:"inherit"}}>重新擲筊</button>}
    </div>);
  }

  // ── ASK PHASE ──
  return(<div style={{textAlign:"center"}}>
    <div style={{fontSize:"2.5rem",marginBottom:14,animation:"glow 3s ease-in-out infinite"}}>🙏</div>
    <div style={{fontSize:".8rem",color:C.txt2,marginBottom:18,lineHeight:1.8}}>在心中默念你的疑惑<br/>誠心向神明請示</div>
    <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="請輸入你心中的疑惑..." rows={3} style={{width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:12,padding:"14px",fontSize:".84rem",color:C.txt,fontFamily:"inherit",resize:"none",marginBottom:16,lineHeight:1.8}}/>
    <button onClick={doThrow} disabled={!question.trim()} style={{padding:"14px 40px",background:!question.trim()?"rgba(212,165,116,.1)":`linear-gradient(135deg,${C.gold},${C.rose})`,color:!question.trim()?C.txt2:"#1a1428",border:"none",borderRadius:28,fontSize:".9rem",fontWeight:700,cursor:!question.trim()?"default":"pointer",fontFamily:"inherit",letterSpacing:".12em",boxShadow:question.trim()?"0 4px 24px rgba(212,165,116,.25)":"none",transition:"all .3s"}}>
      {throws===0?"誠心擲筊":"再擲一次"}
    </button>
    {throws>0&&<div style={{marginTop:10,fontSize:".72rem",color:C.txt2}}>已擲 {throws} 次</div>}
  </div>);
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
const TT=({term,def,children,setTtip})=>{const ref=useRef(null);return (<span ref={ref} style={{display:"inline"}}><span style={{borderBottom:`1px dashed ${C.gold}55`,cursor:"help"}} onClick={()=>{if(ref.current){const r=ref.current.getBoundingClientRect();setTtip({term,def,top:r.bottom+8,left:Math.max(12,Math.min(r.left+r.width/2-120,window.innerWidth-252))})}}}>{children||term}<span style={{display:"inline-block",width:14,height:14,borderRadius:7,background:`${C.gold}15`,border:`1px solid ${C.gold}33`,fontSize:".55rem",lineHeight:"13px",textAlign:"center",color:C.gold,marginLeft:3,verticalAlign:"middle",cursor:"help"}}>?</span></span></span>)};

/* ── TAROT CARD DRAW COMPONENT ── */
const TarotDraw=({phase,card,onDraw,onRedraw})=>{
  /* phase: "idle" | "shuffle" | "draw" | "flip" | "reveal" */
  const cardW=90,cardH=140,stackN=5;
  const cardBack=(x,y,r,z,anim)=>(<div key={`b${z}`} style={{position:"absolute",left:"50%",top:"50%",width:cardW,height:cardH,marginLeft:-cardW/2+x,marginTop:-cardH/2+y,borderRadius:10,background:"linear-gradient(145deg,#2a1f3d,#1a1230)",border:"1.5px solid rgba(180,130,180,.3)",boxShadow:"0 4px 20px rgba(0,0,0,.5),inset 0 0 30px rgba(180,130,180,.05)",transform:`rotate(${r}deg)`,zIndex:z,transition:anim||"all .6s cubic-bezier(.23,1,.32,1)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:6,borderRadius:6,border:"1px solid rgba(180,130,180,.15)"}}/>
    <div style={{fontSize:"1.6rem",color:"rgba(180,130,180,.25)",textShadow:"0 0 10px rgba(180,130,180,.15)"}}>☽</div>
    <div style={{position:"absolute",top:8,left:8,fontSize:".5rem",color:"rgba(180,130,180,.2)"}}>✦</div>
    <div style={{position:"absolute",bottom:8,right:8,fontSize:".5rem",color:"rgba(180,130,180,.2)"}}>✦</div>
  </div>);
  if(phase==="idle")return(<div onClick={onDraw} style={{cursor:"pointer",position:"relative",height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
    {Array.from({length:stackN},(_,i)=>cardBack(i*2-4,-i*1.5,(i-2)*1.2,i))}
    <div style={{position:"absolute",bottom:0,fontSize:".78rem",color:"rgba(180,130,180,.5)",letterSpacing:".1em"}}>輕觸牌堆，抽取今日指引</div>
  </div>);
  if(phase==="shuffle")return(<div style={{position:"relative",height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
    {Array.from({length:stackN},(_,i)=>(<div key={`s${i}`} style={{position:"absolute",left:"50%",top:"50%",width:cardW,height:cardH,marginLeft:-cardW/2,marginTop:-cardH/2,borderRadius:10,background:"linear-gradient(145deg,#2a1f3d,#1a1230)",border:"1.5px solid rgba(180,130,180,.3)",boxShadow:"0 4px 20px rgba(0,0,0,.5),inset 0 0 30px rgba(180,130,180,.05)",zIndex:i,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",animation:`cardShuffle .5s ${i*.1}s ease-in-out infinite alternate`}}>
      <div style={{position:"absolute",inset:6,borderRadius:6,border:"1px solid rgba(180,130,180,.15)"}}/>
      <div style={{fontSize:"1.6rem",color:"rgba(180,130,180,.25)",textShadow:"0 0 10px rgba(180,130,180,.15)"}}>☽</div>
    </div>))}
    <div style={{position:"absolute",bottom:0,fontSize:".78rem",color:"rgba(180,130,180,.5)",animation:"pulse 1.2s ease-in-out infinite"}}>在心中默念你的問題⋯⋯</div>
  </div>);
  if(phase==="draw")return(<div style={{position:"relative",height:240,display:"flex",alignItems:"center",justifyContent:"center"}}>
    {Array.from({length:stackN-1},(_,i)=>cardBack(i*1.5-2,-i*1,i*0.5,i))}
    <div style={{position:"absolute",left:"50%",top:"50%",width:cardW,height:cardH,marginLeft:-cardW/2,marginTop:-cardH/2-50,borderRadius:10,background:"linear-gradient(145deg,#2a1f3d,#1a1230)",border:"1.5px solid rgba(180,130,180,.5)",boxShadow:"0 8px 40px rgba(180,130,180,.2),0 0 60px rgba(180,130,180,.1)",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",animation:"cardLift .8s ease-out forwards"}}>
      <div style={{position:"absolute",inset:6,borderRadius:6,border:"1px solid rgba(180,130,180,.2)"}}/>
      <div style={{fontSize:"1.6rem",color:"rgba(180,130,180,.4)",textShadow:"0 0 15px rgba(180,130,180,.3)"}}>☽</div>
    </div>
  </div>);
  if(phase==="flip"||phase==="reveal")return(<div style={{position:"relative",height:280,display:"flex",alignItems:"center",justifyContent:"center",perspective:800}}>
    <div style={{width:cardW+30,height:cardH+40,position:"relative",transformStyle:"preserve-3d",animation:phase==="flip"?"cardFlip .8s ease-in-out forwards":"none",transform:phase==="reveal"?"rotateY(180deg)":"rotateY(0)"}}>
      {/* Back face */}
      <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",borderRadius:12,background:"linear-gradient(145deg,#2a1f3d,#1a1230)",border:"1.5px solid rgba(180,130,180,.4)",boxShadow:"0 8px 40px rgba(180,130,180,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:"2rem",color:"rgba(180,130,180,.3)"}}>☽</div>
      </div>
      {/* Front face */}
      <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",borderRadius:12,background:"linear-gradient(160deg,rgba(30,22,50,.95),rgba(20,15,35,.98))",border:"1.5px solid rgba(212,165,116,.35)",boxShadow:"0 8px 40px rgba(212,165,116,.15),0 0 80px rgba(180,130,180,.08)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:12}}>
        <div style={{fontSize:"1.5rem",color:C.purp,textShadow:"0 0 20px rgba(180,130,180,.4)",marginBottom:4}}>{card?.img}</div>
        <div style={{fontSize:".82rem",fontWeight:700,color:C.gold,letterSpacing:".08em"}}>{card?.n}</div>
        <div style={{margin:"6px 0",width:"60%",height:1,background:"linear-gradient(90deg,transparent,rgba(212,165,116,.3),transparent)"}}/>
        <div style={{fontSize:".6rem",color:"rgba(180,130,180,.6)"}}>{card?.k}</div>
      </div>
    </div>
  </div>);
  return null;
};

/* ── I CHING DRAW COMPONENT ── */
const IChingDraw=({phase,hex,onDraw,onRedraw})=>{
  const coinStyle=(i,spinning)=>({width:36,height:36,borderRadius:18,background:spinning?"linear-gradient(135deg,rgba(130,180,200,.15),rgba(160,200,160,.1))":"rgba(130,180,200,.08)",border:"1.5px solid rgba(130,180,200,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".7rem",color:C.blue,fontWeight:700,animation:spinning?`coinSpin .4s ${i*.15}s ease-in-out infinite alternate`:"none",boxShadow:spinning?"0 0 20px rgba(130,180,200,.15)":"none",transition:"all .3s"});
  if(phase==="idle")return(<div onClick={onDraw} style={{cursor:"pointer",textAlign:"center",padding:"20px 0"}}>
    <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:16}}>
      {[0,1,2].map(i=><div key={i} style={coinStyle(i,false)}>☰</div>)}
    </div>
    <div style={{fontSize:".78rem",color:"rgba(130,180,200,.5)",letterSpacing:".1em"}}>擲出三枚銅錢，卜問天機</div>
  </div>);
  if(phase==="toss")return(<div style={{textAlign:"center",padding:"20px 0"}}>
    <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:16}}>
      {[0,1,2].map(i=><div key={i} style={coinStyle(i,true)}>☰</div>)}
    </div>
    <div style={{fontSize:".78rem",color:"rgba(130,180,200,.5)",animation:"pulse 1.2s ease-in-out infinite"}}>銅錢翻轉中⋯⋯靜心感受</div>
  </div>);
  if(phase==="reveal")return(<div style={{textAlign:"center",padding:"20px 0"}}>
    <div style={{display:"inline-block",padding:"24px 36px",borderRadius:16,background:"rgba(130,180,200,.05)",border:"1px solid rgba(130,180,200,.15)",animation:"fadeUp .8s ease-out"}}>
      <div style={{fontSize:"3.5rem",color:C.blue,textShadow:"0 0 30px rgba(130,180,200,.3),0 0 60px rgba(130,180,200,.1)",marginBottom:8,fontFamily:"serif",letterSpacing:".2em"}}>{hex?.n}</div>
      <div style={{fontSize:".82rem",color:"rgba(255,255,255,.45)",letterSpacing:".15em"}}>{hex?.t}</div>
    </div>
  </div>);
  return null;
};
export default function App(){
  const[page,setPage]=useState("input");
  const nebulaRef=useRef(null);const[nebulaBg,setNebulaBg]=useState(null); // input, home, ziwei, bazi, zodiac, lifepath, humandesign, mayan, fortune
  /* Generate high-res nebula texture once on mount */
  useEffect(()=>{
    const W=800,H=1400;
    const c=document.createElement("canvas");c.width=W;c.height=H;
    const x=c.getContext("2d");
    /* Black base */
    x.fillStyle="#0c0814";x.fillRect(0,0,W,H);
    /* Noise function for organic texture */
    const noise=(px,py,sc)=>{const v=Math.sin(px*sc*12.9898+py*sc*78.233)*43758.5453;return v-Math.floor(v)};
    /* Paint nebula in layers using many small semi-transparent circles */
    const paintCloud=(cx,cy,rx,ry,r,g,b,maxA,count)=>{
      for(let i=0;i<count;i++){
        const ang=Math.random()*Math.PI*2;
        const dist=Math.pow(Math.random(),.6);
        const px=cx+Math.cos(ang)*dist*rx+(Math.random()-.5)*rx*.3;
        const py=cy+Math.sin(ang)*dist*ry+(Math.random()-.5)*ry*.3;
        const sz=Math.random()*rx*.18+4;
        const a=maxA*(1-dist*.8)*(Math.random()*.5+.5);
        const g2=x.createRadialGradient(px,py,0,px,py,sz);
        g2.addColorStop(0,`rgba(${r},${g},${b},${a})`);
        g2.addColorStop(1,"transparent");
        x.fillStyle=g2;x.fillRect(px-sz,py-sz,sz*2,sz*2);
      }
    };
    x.globalCompositeOperation="screen";
    /* Layer 1: Large purple nebula - upper left */
    paintCloud(W*.35,H*.28,W*.45,H*.2,160,50,180,.12,800);
    paintCloud(W*.35,H*.28,W*.3,H*.12,200,80,220,.08,400);
    /* Layer 2: Bright magenta/pink band across center */
    paintCloud(W*.4,H*.38,W*.5,H*.08,220,100,190,.15,600);
    paintCloud(W*.45,H*.35,W*.4,H*.06,255,140,220,.1,300);
    /* Layer 3: Secondary pink swirl - lower */
    paintCloud(W*.3,H*.52,W*.45,H*.07,200,90,170,.1,500);
    /* Layer 4: Bright core hotspot */
    paintCloud(W*.38,H*.35,W*.12,H*.06,255,160,230,.2,300);
    paintCloud(W*.38,H*.35,W*.06,H*.03,255,200,240,.15,150);
    /* Layer 5: Gold nebula - bottom right */
    paintCloud(W*.65,H*.72,W*.35,H*.18,240,200,120,.12,600);
    paintCloud(W*.6,H*.75,W*.25,H*.12,255,220,140,.08,400);
    /* Layer 6: Gold accent bottom left */
    paintCloud(W*.25,H*.82,W*.3,H*.1,230,190,110,.1,400);
    /* Layer 7: Subtle blue-purple lower area */
    paintCloud(W*.5,H*.6,W*.5,H*.15,100,60,160,.05,300);
    /* Stars - many tiny bright dots */
    x.globalCompositeOperation="screen";
    for(let i=0;i<600;i++){
      const sx=Math.random()*W,sy=Math.random()*H;
      const bright=Math.random();
      const sz=bright>.95?2:bright>.8?1.2:.6;
      const a=bright>.9?.8:bright>.6?.4:.15;
      x.fillStyle=bright>.7?`rgba(255,240,220,${a})`:`rgba(220,220,255,${a})`;
      x.beginPath();x.arc(sx,sy,sz,0,6.28);x.fill();
      /* Cross flare on brightest */
      if(bright>.93){
        x.strokeStyle=`rgba(255,240,220,${a*.3})`;x.lineWidth=.5;
        x.beginPath();x.moveTo(sx-sz*4,sy);x.lineTo(sx+sz*4,sy);x.stroke();
        x.beginPath();x.moveTo(sx,sy-sz*4);x.lineTo(sx,sy+sz*4);x.stroke();
      }
    }
    /* Dense golden sparkle cluster at bottom 30% */
    for(let i=0;i<300;i++){
      const sx=Math.random()*W,sy=H*.65+Math.random()*H*.35;
      const bright=Math.random();
      const sz=bright>.9?2.5:bright>.7?1.5:.8;
      const a=bright>.8?.7:bright>.5?.35:.15;
      x.fillStyle=`rgba(255,${220+Math.random()*30},${140+Math.random()*60},${a})`;
      x.beginPath();x.arc(sx,sy,sz,0,6.28);x.fill();
      if(bright>.88){
        x.strokeStyle=`rgba(255,225,160,${a*.25})`;x.lineWidth=.4;
        const fl=sz*3.5;
        x.beginPath();x.moveTo(sx-fl,sy);x.lineTo(sx+fl,sy);x.stroke();
        x.beginPath();x.moveTo(sx,sy-fl);x.lineTo(sx,sy+fl);x.stroke();
      }
    }
    setNebulaBg(c.toDataURL("image/jpeg",.92));
  },[]);
  const[bY,sBY]=useState(1996),[bM,sBM]=useState(3),[bD,sBD]=useState(15),[bH,sBH]=useState(8);
  const[gen,sGen]=useState("female"),[cal,sCal]=useState("solar");
  /* Dynamic max days for selected year/month */
  const maxDays=useMemo(()=>{
    if(cal==="lunar"){
      /* lunar: use lookup table */
      if(bY>=1900&&bY<=2100)return mmd(bY,bM);
      return 30;
    }else{
      /* solar: standard Gregorian rules */
      if([1,3,5,7,8,10,12].includes(bM))return 31;
      if([4,6,9,11].includes(bM))return 30;
      /* Feb: check leap year */
      const leap=(bY%4===0&&bY%100!==0)||(bY%400===0);
      return leap?29:28;
    }
  },[bY,bM,cal]);
  useEffect(()=>{if(bD>maxDays)sBD(maxDays)},[maxDays,bD]);
  const[anim,sAnim]=useState(false);
  const[soul,setSoul]=useState(null); // all computed data
  const[ttip,setTtip]=useState(null);
  const[tarotCard,setTarotCard]=useState(null);const[tarotPhase,setTarotPhase]=useState("idle");
  const[ichingHex,setIchingHex]=useState(null);const[ichingPhase,setIchingPhase]=useState("idle");
  const[overlay,setOverlay]=useState(null); // null | "tarot" | "iching" | "fortune"
  const[zwTab,setZwTab]=useState(0);
  const[bzTab,setBzTab]=useState(0);const[pillarOpen,setPillarOpen]=useState(null);
  const[hdTab,setHdTab]=useState(0);const[hdSelCh,setHdSelCh]=useState(null);const[hdGateOpen,setHdGateOpen]=useState(null);
  const[aiReading,setAiReading]=useState(null);const[aiLoading,setAiLoading]=useState(false);
  const[cw,sCw]=useState(800);
  const cr=useRef(null);
  useEffect(()=>{const m=()=>{if(cr.current)sCw(Math.max(500,Math.min(1000,cr.current.offsetWidth-32)))};m();window.addEventListener("resize",m);return()=>window.removeEventListener("resize",m)},[]);

  /* ── Call Claude API for deep ziwei reading ── */
  const fetchAiReading=async(chartData)=>{
    setAiLoading(true);setAiReading(null);
    const{ziwei:ch,bazi:bz}=chartData;
    const cy=new Date().getFullYear(),curAge=cy-ch.bY;
    const juStart=ch.ju.value;
    /* Build 大限 summary */
    const dxSummary=[];
    for(let i=0;i<7&&juStart+i*10<85;i++){
      const sa=juStart+i*10,ea=Math.min(sa+9,84);
      const pIdx=(ch.lpp+i)%12;
      const p=ch.P.find(pp=>pp.bi===pIdx)||ch.P[i%12];
      const isCur=curAge>=sa&&curAge<=ea;
      const stars=[...p.stars,...p.ls].join("、")||"空宮";
      const sha=p.us.join("、");
      const sihua=p.sh.map(s=>`${s.star}${s.name}`).join("、");
      dxSummary.push(`${sa}-${ea}歲（${ch.bY+sa}-${ch.bY+ea}）：${PN[ch.P.indexOf(p)]||PN[i%12]}（${BR[pIdx]}宮），主星=${stars}${sha?"，煞星="+sha:""}${sihua?"，四化="+sihua:""}${isCur?" ← 當前大限":""}`);
    }
    /* 流年四化 */
    const lyYsi=((cy-4)%10+10)%10;
    const lySH=SHT[lyYsi];
    const prompt=`你是一位頂級紫微斗數命理師，擅長用溫暖、有深度、具有療癒感的語言解讀命盤。請根據以下命盤資料，生成深度個人化解讀。

命盤基本資料：
- 農曆出生年：${ch.yg}年
- 五行局：${ch.ju.name}（${ch.ju.value}歲起運）
- 命宮：${BR[ch.lpp]}宮
- 身宮：${BR[ch.bpp]}宮
- 日主五行：${bz.dmEl}
- 四柱：${bz.pillars?bz.pillars.map(p=>`${p.label}${p.stem}${p.branch}(${p.stemEl}${p.stemGod})`).join("、"):""}
- 命局格局：${bz.mainPattern||"正格"}
- 身強弱：${bz.sDesc||""}
- 八字大運：${bz.daYun?bz.daYun.map(d=>`${d.age}歲${d.stem}${d.branch}(${d.el})${d.current?" ←當前":""}${d.peak?" ★黃金":""}`).join("、"):""}
- 性別：${chartData.gen||"未知"}
- 目前年齡：約${curAge}歲
- 生年四化：${SHT[ch.ysi][0]}化祿、${SHT[ch.ysi][1]}化權、${SHT[ch.ysi][2]}化科、${SHT[ch.ysi][3]}化忌

十二宮星曜分佈：
${ch.P.map((p,i)=>`${PN[i]}（${BR[p.bi]}）：主星=${p.stars.join("、")||"空宮"}，吉星=${p.ls.join("、")||"無"}，煞星=${p.us.join("、")||"無"}，四化=${p.sh.map(s=>s.star+s.name).join("、")||"無"}`).join("\n")}

十年大限走勢：
${dxSummary.join("\n")}

${cy}年（${ST[lyYsi]}${BR[((cy-4)%12+12)%12]}年）流年四化：
${lySH[0]}化祿、${lySH[1]}化權、${lySH[2]}化科、${lySH[3]}化忌

請用繁體中文回覆，回覆格式為純JSON（不要markdown），結構如下：
{
  "liuNian": {
    "overall": "整體運勢200字深度解讀",
    "career": "事業運200字",
    "wealth": "財運200字",
    "love": "感情200字",
    "health": "健康150字",
    "quarterly": ["Q1 50字","Q2 50字","Q3 50字","Q4 50字"]
  },
  "daXian": ["第1個大限100字解讀","第2個大限100字","...每個大限都要"],
  "peak": "200字結論，說明黃金大運何時來、現在該怎麼準備",
  "bazi": {
    "personality": "300字日主性格深度解讀，要引用四柱天干地支和十神",
    "overall": "200字今年流年整體格局解讀",
    "career": "200字事業運解讀",
    "wealth": "200字財運解讀",
    "love": "200字感情人際解讀",
    "health": "150字健康解讀",
    "daYun": ["每個大運100字解讀，要提到天干地支和十神對日主的影響"],
    "peak": "200字結論，黃金大運何時來、現在該怎麼準備"
  }
}

重要原則：
1. 每段解讀都要具體引用命盤中的星曜和宮位，不能泛泛而談
2. 語氣溫暖療癒，像跟朋友深談，不要冰冷的命理術語堆砌
3. 負面的部分要轉化為成長建議和正面啟示
4. 要有「啊這就是在說我」的個人化感覺`;
    try{
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,
          messages:[{role:"user",content:prompt}]})
      });
      const data=await resp.json();
      const txt=data.content?.map(c=>c.text||"").join("")||"";
      const clean=txt.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setAiReading(parsed);
    }catch(e){console.error("AI reading error:",e);setAiReading(null);}
    finally{setAiLoading(false);}
  };

  const unlock=useCallback(()=>{
    sAnim(true);
    setTimeout(()=>{
      const isLunar=cal==="lunar";
      const solar=isLunar?l2s(bY,bM,bD):{year:bY,month:bM,day:bD};
      const lunar=isLunar?{year:bY,month:bM,day:bD}:s2l(bY,bM,bD);
      const zodiac=getZodiac(solar.month,solar.day);
      const lp=getLP(solar.year,solar.month,solar.day);
      const hd=getHD(solar.year,solar.month,solar.day,bH);
      const mayan=getMayan(solar.year,solar.month,solar.day);
      const bazi=getBazi(lunar.year,lunar.month,lunar.day,bH,solar.year,solar.month,solar.day);
      const ziwei=genChart(bY,bM,bD,bH,isLunar);
      const syn=synthesize(zodiac,lp,hd,mayan,bazi,ziwei);
      const soulData={zodiac,lp,hd,mayan,bazi,ziwei,syn,lpd:LPD[lp]||LPD[1],gen};
      setSoul(soulData);
      setPage("home");sAnim(false);
      /* Fire API call in background */
      fetchAiReading(soulData);
    },1200);
  },[bY,bM,bD,bH,gen,cal]);



  const PB=({icon,title})=><div onClick={()=>setPage(soul?"home":"input")} style={{display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:14,padding:"6px 14px 6px 8px",borderRadius:20,background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,fontSize:".76rem",color:C.txt2,transition:"all .2s"}}><span style={{fontSize:".65rem",opacity:.5}}>←</span><span style={{fontSize:"1rem"}}>{icon}</span><span>{title}</span></div>;

  /* ── TAROT DECK (Major Arcana, all positive reframes) ── */
  const TAROT=[
    {n:"愚者",k:"無限可能",img:"0",d:"宇宙正在邀請你放下包袱，帶著赤子之心踏入未知。此刻的「不確定」不是危險，而是生命送給你的最美禮物——自由。信任直覺，那條沒有人走過的路，正為你而開。"},
    {n:"魔術師",k:"心想事成",img:"I",d:"你已經擁有實現願望的一切資源，只是還沒意識到。宇宙提醒你：此刻的你比你以為的更有力量。勇敢地把想法付諸行動吧，天時地利人和正在向你匯聚。"},
    {n:"女祭司",k:"直覺覺醒",img:"II",d:"答案不在外面，而在你的內心深處。今天適合安靜下來，聆聽那個細微的內在聲音。你的直覺正在對你低語，那些似曾相識的感覺、突如其來的靈感，都是宇宙給你的密碼。"},
    {n:"皇后",k:"豐盛綻放",img:"III",d:"生命的豐盛正在向你流動。無論是愛情、創造力還是物質層面，你正處於一個豐收的能量場中。允許自己接受美好，你值得擁有一切溫柔的事物。"},
    {n:"皇帝",k:"掌握全局",img:"IV",d:"你的內在領袖正在甦醒。此刻的你擁有做出重大決定的智慧和勇氣。宇宙信任你的判斷——站穩腳步，用你的遠見為自己和身邊的人創造穩定的未來。"},
    {n:"教皇",k:"靈性傳承",img:"V",d:"一位重要的導師或一段深刻的智慧正在向你走來。保持謙遜和開放，生命中最珍貴的教導往往來自意想不到的地方。今天適合學習、閱讀，或向信任的人請教。"},
    {n:"戀人",k:"靈魂共鳴",img:"VI",d:"一段重要的連結正在深化——可能是愛情，也可能是你與自己內心的和解。宇宙提醒你：真正的愛不是依賴，而是兩個完整靈魂的共振。傾聽你的心，它知道答案。"},
    {n:"戰車",k:"勢如破竹",img:"VII",d:"你積蓄已久的能量即將爆發。所有的準備、等待和忍耐，都在為這一刻鋪路。宇宙說：全速前進吧！障礙會在你的決心面前自動讓路。"},
    {n:"力量",k:"柔中帶剛",img:"VIII",d:"真正的力量不是征服，而是溫柔地擁抱自己的脆弱。你正在學會一種更深層的勇敢——承認恐懼，然後帶著恐懼繼續前行。這份溫柔的堅定，是宇宙給你最大的祝福。"},
    {n:"隱者",k:"內在探索",img:"IX",d:"宇宙邀請你暫時從喧囂中抽身，與自己獨處。這不是孤獨，而是一段珍貴的自我對話時光。在安靜中，你會聽見那些被日常噪音淹沒的內在智慧。"},
    {n:"命運之輪",k:"轉運時刻",img:"X",d:"生命的巨輪正在轉動，一個全新的循環即將開始。過去的停滯和困頓正在瓦解，新的機遇正從地平線升起。順應這股流動吧——宇宙正在為你重新洗牌。"},
    {n:"正義",k:"因果平衡",img:"XI",d:"你過去種下的善因正在結果。宇宙的天秤正在向你傾斜——那些你以為沒有回報的付出、被忽略的善意，現在都將以意想不到的方式回到你身邊。"},
    {n:"倒吊人",k:"全新視角",img:"XII",d:"試著用完全不同的角度看待眼前的處境。那些看似困境的事情，換個角度可能是最大的禮物。宇宙說：放棄掙扎，讓自己懸浮在未知中，答案會自己浮現。"},
    {n:"死神",k:"華麗蛻變",img:"XIII",d:"一個舊的篇章正在溫柔地落幕，為更美好的新故事騰出空間。蛻變的過程也許不太舒適，但蝴蝶破繭而出的瞬間，就是你最耀眼的時刻。放手，讓新生發生。"},
    {n:"節制",k:"和諧之道",img:"XIV",d:"你的內在正在尋找一個完美的平衡點。不急不緩、不多不少——宇宙提醒你，最優雅的生活方式是「恰到好處」。今天適合調和你生活中的各個面向，讓一切回歸和諧。"},
    {n:"高塔",k:"破繭重生",img:"XV",d:"一道閃電正在照亮被你忽略的真相。這不是毀滅，而是宇宙在幫你移除那些不再服務你的舊有框架。當人造的高塔倒塌，你才能看見真正的天空有多遼闊。"},
    {n:"星星",k:"希望之光",img:"XVII",d:"最黑暗的夜空中，星星正在為你閃爍。宇宙要你知道：無論你經歷了什麼，希望從未離開。你的願望正在被聽見，保持信心，美好的事物正在趕來的路上。"},
    {n:"月亮",k:"潛意識覺醒",img:"XVIII",d:"夢境、直覺、似曾相識的感覺——你的潛意識正在傳遞重要的訊息。今天特別適合記錄你的夢、留意那些「巧合」。月光下，真相會以最溫柔的方式向你揭示。"},
    {n:"太陽",k:"光芒萬丈",img:"XIX",d:"金色的能量正在環繞著你！這是一張充滿喜悅和成功的牌。無論你正在經歷什麼，宇宙要你知道：陽光已經穿透烏雲。敞開心扉，接受這份溫暖的擁抱吧。"},
    {n:"審判",k:"靈魂召喚",img:"XX",d:"你的靈魂正在呼喚你回歸真實的自己。那個你一直壓抑的夢想、推遲的決定，現在是時候了。宇宙的號角已經響起——勇敢回應你內心最深處的召喚。"},
    {n:"世界",k:"圓滿完成",img:"XXI",d:"恭喜你！你正站在一個完整循環的終點，也是新旅程的起點。你付出的一切努力都在此刻匯聚成圓滿。深深地感謝自己走過的每一步，然後帶著祝福，踏入下一個精彩篇章。"}
  ];
  /* ── I CHING HEXAGRAMS (simplified 8-trigram draw, positive reframes) ── */
  const ICHING=[
    {n:"乾",t:"天行健",k:"剛健不息",d:"宇宙以最強大的能量支持著你。此刻的你如同龍躍九天，內在的力量正等待釋放。不必壓抑自己的雄心壯志——你值得更廣闊的舞台。行動吧，天道酬勤。"},
    {n:"坤",t:"地勢坤",k:"厚德載物",d:"大地的智慧在提醒你：最偉大的力量是包容。此刻適合收斂鋒芒，用溫柔和耐心去承接生命中的一切。你不需要爭先，因為大地從不急躁，卻承載萬物。"},
    {n:"震",t:"雷出地奮",k:"破局新生",d:"沉寂已久的能量即將以雷霆之勢爆發。不要害怕突如其來的變化——那是宇宙在幫你打破僵局。震動過後，一切都會煥然一新。把恐懼轉化為興奮吧。"},
    {n:"巽",t:"風行天下",k:"柔順漸進",d:"如風一般溫柔而持續地前進。此刻不適合強攻，而是用柔軟的姿態滲透。水滴石穿、春風化雨——你的影響力正在以最溫柔的方式擴散開來。"},
    {n:"坎",t:"水流不息",k:"向內沉澱",d:"宇宙邀請你進入一段向內探索的旅程。如同水流入深谷，此刻適合沉澱、反思、傾聽內心。這不是困境，而是生命賜予你的靜修期。在最深的水底，往往藏著最珍貴的寶藏。"},
    {n:"離",t:"明照四方",k:"光明綻放",d:"你的內在之火正在明亮地燃燒。此刻適合展現自己、表達想法、創造作品。你的光芒不是為了炫耀，而是為了照亮——照亮自己的路，也溫暖身邊的人。"},
    {n:"艮",t:"山止則止",k:"靜觀其變",d:"智慧的暫停比盲目的前進更有力量。宇宙說：停下腳步，站在山巔俯瞰全局。此刻的等待不是消極，而是在積蓄能量，等待最佳時機一躍而起。"},
    {n:"兌",t:"澤潤萬物",k:"喜悅分享",d:"快樂和豐盛正在向你匯聚。此刻適合與人分享你的喜悅、你的知識、你的溫暖。當你敞開心扉給予，宇宙會以更大的豐盛回饋你。微笑是你最強大的魔法。"}
  ];
  const openTarot=()=>{setOverlay("tarot");if(tarotPhase==="idle")drawTarot();};
  const openIChing=()=>{setOverlay("iching");if(ichingPhase==="idle")drawIChing();};
  const openFortune=()=>{setOverlay(null);setPage("fortune");};
  const drawTarot=()=>{if(tarotPhase!=="idle"&&tarotPhase!=="reveal")return;setTarotCard(null);setTarotPhase("shuffle");setTimeout(()=>setTarotPhase("draw"),1800);setTimeout(()=>{const c=TAROT[Math.floor(Math.random()*TAROT.length)];setTarotCard(c);setTarotPhase("flip");},2600);setTimeout(()=>setTarotPhase("reveal"),3400);};
  const drawIChing=()=>{if(ichingPhase!=="idle"&&ichingPhase!=="reveal")return;setIchingHex(null);setIchingPhase("toss");setTimeout(()=>{const h=ICHING[Math.floor(Math.random()*ICHING.length)];setIchingHex(h);setIchingPhase("reveal");},2600);};

  const navCards=[
    {id:"ziwei",icon:"📈",title:"紫微走勢",sub:"用K線看你的一生運勢起伏"},
    {id:"zodiac",icon:"✨",title:"星座解析",sub:`${soul?.zodiac||""}的深度剖析`},
    {id:"lifepath",icon:"☽",title:"生命靈數",sub:`靈數${soul?.lp||""}號的靈魂密碼`},
    {id:"humandesign",icon:"⚡",title:"人類圖",sub:`你的能量類型與策略`},
    {id:"mayan",icon:"🌀",title:"瑪雅曆",sub:`你的星系印記`},
    {id:"bazi",icon:"🎋",title:"八字命理",sub:`日主五行解讀`},
    {id:"fortune",icon:"🏮",title:"線上擲筊求籤",sub:"行天宮籤詩指引"},
  ];

  /* ═══ FULLSCREEN OVERLAY ═══ */
  if(overlay==="tarot"||overlay==="iching"){
    const isTarot=overlay==="tarot";
    const ph=isTarot?tarotPhase:ichingPhase;
    const closeOverlay=()=>{setOverlay(null);if(isTarot)setTarotPhase("idle");else setIchingPhase("idle");};
    return(<div style={{position:"fixed",inset:0,zIndex:9999,background:`radial-gradient(ellipse at 50% 30%,${isTarot?"rgba(180,130,180,.12)":"rgba(130,180,200,.12)"},transparent 60%),rgba(8,6,18,.97)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt,padding:20,overflow:"auto"}}>
      <Stars/>
      {/* Close button */}
      <div onClick={closeOverlay} style={{position:"absolute",top:16,right:20,cursor:"pointer",fontSize:"1.2rem",color:"rgba(255,255,255,.3)",zIndex:10,width:36,height:36,borderRadius:18,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>✕</div>
      {/* Title */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:".72rem",color:isTarot?"rgba(180,130,180,.5)":"rgba(130,180,200,.5)",letterSpacing:".25em",marginBottom:6}}>{isTarot?"✦ DAILY TAROT ✦":"◎ I CHING ◎"}</div>
        <div style={{fontSize:"1.2rem",fontWeight:700,color:"rgba(255,255,255,.85)",letterSpacing:".1em"}}>{isTarot?"每日專屬塔羅":"易經禪卦"}</div>
      </div>
      {/* Animation Area */}
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:400}}>
        {isTarot?<TarotDraw phase={tarotPhase} card={tarotCard} onDraw={drawTarot}/>:<IChingDraw phase={ichingPhase} hex={ichingHex} onDraw={drawIChing}/>}
        {/* Result text */}
        {ph==="reveal"&&(isTarot?tarotCard:ichingHex)&&<div style={{marginTop:16,animation:"fadeUp .6s ease-out"}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            {isTarot&&<div style={{fontSize:"1.15rem",fontWeight:700,color:C.purp,marginBottom:6}}>{tarotCard.n}</div>}
            <div style={{display:"inline-block",padding:"5px 18px",borderRadius:16,background:isTarot?"rgba(180,130,180,.1)":"rgba(130,180,200,.1)",border:`1px solid ${isTarot?"rgba(180,130,180,.2)":"rgba(130,180,200,.2)"}`,fontSize:".8rem",color:isTarot?C.purp:C.blue}}>{isTarot?tarotCard.k:ichingHex.k}</div>
          </div>
          <div style={{fontSize:".95rem",lineHeight:2.2,color:"rgba(255,255,255,.85)",textAlign:"center",maxWidth:360,margin:"0 auto"}}>{isTarot?tarotCard.d:ichingHex.d}</div>
          <div style={{textAlign:"center",marginTop:24,display:"flex",gap:14,justifyContent:"center"}}>
            <span onClick={()=>{if(isTarot){setTarotPhase("idle");setTimeout(drawTarot,100)}else{setIchingPhase("idle");setTimeout(drawIChing,100)}}} style={{cursor:"pointer",padding:"8px 22px",borderRadius:20,background:isTarot?"rgba(180,130,180,.1)":"rgba(130,180,200,.1)",border:`1px solid ${isTarot?"rgba(180,130,180,.2)":"rgba(130,180,200,.2)"}`,fontSize:".82rem",color:isTarot?C.purp:C.blue,transition:"all .3s"}}>{isTarot?"再抽一張":"再卜一卦"}</span>
            <span onClick={closeOverlay} style={{cursor:"pointer",padding:"8px 22px",borderRadius:20,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",fontSize:".82rem",color:"rgba(255,255,255,.4)",transition:"all .3s"}}>返回</span>
          </div>
        </div>}
      </div>
      <style>{CSS}</style>
    </div>);
  }
  // ── INPUT PAGE ──
  if(page==="input"){
    return(<div style={{minHeight:"100vh",fontFamily:"'Noto Serif SC','STSong',serif",color:"#e8dcc8",position:"relative",overflow:"hidden",background:"#0c0814"}}>
      {/* Pre-rendered nebula background */}
      {nebulaBg&&<div style={{position:"absolute",inset:"-5%",zIndex:0,backgroundImage:`url(${nebulaBg})`,backgroundSize:"cover",backgroundPosition:"center",animation:"nebulaSway 30s ease-in-out infinite alternate"}}/>}
      {/* Animated overlay glow layers for movement */}
      <div style={{position:"absolute",inset:"-10%",zIndex:1,background:"radial-gradient(ellipse at 40% 35%,rgba(200,80,180,.08),transparent 50%)",animation:"nebulaFloat1 15s ease-in-out infinite alternate",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:"-10%",zIndex:1,background:"radial-gradient(ellipse at 60% 75%,rgba(240,200,120,.06),transparent 45%)",animation:"nebulaFloat3 18s ease-in-out infinite alternate",pointerEvents:"none"}}/>
      {/* Constellation SVGs */}
      <svg style={{position:"absolute",top:"5%",right:"5%",width:120,height:120,opacity:.18,zIndex:2}} viewBox="0 0 100 100"><circle cx="18" cy="12" r="1.8" fill="#d4a574"/><circle cx="48" cy="6" r="1.2" fill="#d4a574"/><circle cx="78" cy="20" r="1.8" fill="#d4a574"/><circle cx="62" cy="48" r="1.2" fill="#d4a574"/><circle cx="88" cy="58" r="1.5" fill="#d4a574"/><circle cx="40" cy="38" r="1" fill="#d4a574"/><line x1="18" y1="12" x2="48" y2="6" stroke="#d4a574" strokeWidth=".5" opacity=".6"/><line x1="48" y1="6" x2="78" y2="20" stroke="#d4a574" strokeWidth=".5" opacity=".6"/><line x1="78" y1="20" x2="62" y2="48" stroke="#d4a574" strokeWidth=".5" opacity=".6"/><line x1="62" y1="48" x2="88" y2="58" stroke="#d4a574" strokeWidth=".5" opacity=".6"/><line x1="48" y1="6" x2="40" y2="38" stroke="#d4a574" strokeWidth=".4" opacity=".4"/><line x1="40" y1="38" x2="62" y2="48" stroke="#d4a574" strokeWidth=".4" opacity=".4"/></svg>
      <svg style={{position:"absolute",bottom:"4%",left:"3%",width:100,height:100,opacity:.12,zIndex:2}} viewBox="0 0 100 100"><circle cx="12" cy="30" r="1.5" fill="#c0a0c0"/><circle cx="38" cy="12" r="1" fill="#c0a0c0"/><circle cx="58" cy="38" r="1.5" fill="#c0a0c0"/><circle cx="28" cy="62" r="1" fill="#c0a0c0"/><circle cx="72" cy="72" r="1.5" fill="#c0a0c0"/><line x1="12" y1="30" x2="38" y2="12" stroke="#c0a0c0" strokeWidth=".5" opacity=".5"/><line x1="38" y1="12" x2="58" y2="38" stroke="#c0a0c0" strokeWidth=".5" opacity=".5"/><line x1="58" y1="38" x2="28" y2="62" stroke="#c0a0c0" strokeWidth=".5" opacity=".5"/><line x1="28" y1="62" x2="72" y2="72" stroke="#c0a0c0" strokeWidth=".5" opacity=".5"/></svg>
      {/* Content */}
      <div style={{position:"relative",zIndex:3,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"40px 20px"}}>
        <div style={{width:"100%",maxWidth:460}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:"clamp(2.5rem,9vw,3.8rem)",fontWeight:900,letterSpacing:".22em",color:"#e8c0b8",textShadow:"0 0 40px rgba(220,160,160,.15),0 2px 4px rgba(0,0,0,.4)"}}>靈魂藍圖</div>
            <div style={{fontSize:".82rem",color:"rgba(220,200,190,.75)",letterSpacing:".4em",marginTop:8,fontStyle:"italic"}}>SOUL BLUEPRINT</div>
            <div style={{margin:"20px auto",width:"45%",height:1,background:"linear-gradient(90deg,transparent,rgba(200,170,150,.18),transparent)"}}/>
            <div style={{fontSize:".86rem",color:"rgba(220,200,190,.7)",lineHeight:1.9,letterSpacing:".08em"}}>融合六大命理系統，解鎖專屬於你的靈魂印記</div>
          </div>
          <div style={{background:"rgba(16,12,24,.82)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:20,border:"1px solid rgba(200,180,160,.07)",padding:"32px 28px 26px",boxShadow:"0 12px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.02)"}}>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:24}}>
              {[["solar","陽曆"],["lunar","農曆"]].map(([v,l])=><button key={v} onClick={()=>sCal(v)} style={{padding:"9px 32px",fontSize:".92rem",fontFamily:"inherit",cursor:"pointer",background:cal===v?"#f0d0c0":"transparent",color:cal===v?"#3a2525":"rgba(210,190,180,.55)",border:"none",borderRadius:22,fontWeight:cal===v?700:400,transition:"all .3s",letterSpacing:".12em"}}>{l}</button>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div><label style={{display:"block",fontSize:".8rem",color:"rgba(210,190,180,.55)",marginBottom:6}}>出生年</label><input type="number" min={1924} max={2010} value={bY} onChange={e=>sBY(+e.target.value)} style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.015)",border:"1px solid rgba(200,180,170,.08)",borderRadius:10,fontSize:"1.05rem",color:"#e8dcc8",fontFamily:"inherit"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><label style={{display:"block",fontSize:".8rem",color:"rgba(210,190,180,.55)",marginBottom:6}}>出生月</label><select value={bM} onChange={e=>sBM(+e.target.value)} style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.015)",border:"1px solid rgba(200,180,170,.08)",borderRadius:10,fontSize:"1.05rem",color:"#e8dcc8",fontFamily:"inherit",appearance:"auto"}}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1} style={{background:"#14101e"}}>{i+1}月</option>)}</select></div>
                <div><label style={{display:"block",fontSize:".8rem",color:"rgba(210,190,180,.55)",marginBottom:6}}>出生日</label><select value={bD} onChange={e=>sBD(+e.target.value)} style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.015)",border:"1px solid rgba(200,180,170,.08)",borderRadius:10,fontSize:"1.05rem",color:"#e8dcc8",fontFamily:"inherit",appearance:"auto"}}>{Array.from({length:maxDays},(_,i)=><option key={i+1} value={i+1} style={{background:"#14101e"}}>{i+1}日</option>)}</select></div>
              </div>
              <div><label style={{display:"block",fontSize:".8rem",color:"rgba(210,190,180,.55)",marginBottom:6}}>出生時辰</label><select value={bH} onChange={e=>sBH(+e.target.value)} style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.015)",border:"1px solid rgba(200,180,170,.08)",borderRadius:10,fontSize:"1.05rem",color:"#e8dcc8",fontFamily:"inherit",appearance:"auto"}}>{SC_OPT.map(o=><option key={o.v} value={o.v} style={{background:"#14101e"}}>{o.l}</option>)}</select></div>
              <div><label style={{display:"block",fontSize:".8rem",color:"rgba(210,190,180,.55)",marginBottom:6}}>性別</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["female","女"],["male","男"]].map(([v,l])=><button key={v} onClick={()=>sGen(v)} style={{padding:"14px",borderRadius:10,fontSize:"1.05rem",fontFamily:"inherit",cursor:"pointer",background:gen===v?"linear-gradient(135deg,rgba(240,210,195,.2),rgba(220,190,170,.12))":"transparent",color:gen===v?"#e8ccc0":"rgba(210,190,180,.55)",border:gen===v?"1px solid rgba(240,210,195,.2)":"1px solid rgba(200,180,170,.08)",transition:"all .3s",fontWeight:gen===v?600:400,letterSpacing:".15em"}}>{l}</button>)}</div></div>
            </div>
          </div>
          <button onClick={unlock} disabled={anim} style={{display:"block",width:"100%",margin:"18px 0 0",padding:"17px",background:anim?"rgba(200,170,150,.08)":"linear-gradient(135deg,#f0d0c0,#e8d0a8,#f0c8c0)",color:anim?"rgba(210,190,180,.55)":"#3a2525",border:"none",borderRadius:14,fontSize:"1.08rem",fontWeight:700,cursor:anim?"wait":"pointer",fontFamily:"inherit",letterSpacing:".2em",boxShadow:anim?"none":"0 6px 30px rgba(200,170,140,.12)",transition:"all .4s"}}>{anim?"✧ 正在解讀星象 ✧":"✦ 解鎖靈魂印記 ✦"}</button>
          <div style={{marginTop:24,display:"flex",gap:10}}>
            {[{fn:openFortune,ic:"☰",lb:"求籤",cl:"200,170,140"},{fn:openTarot,ic:"☽",lb:"塔羅",cl:"180,140,180"},{fn:openIChing,ic:"◎",lb:"易經",cl:"140,170,190"}].map((o,i)=><div key={i} onClick={o.fn} style={{flex:1,cursor:"pointer",padding:"12px 8px",borderRadius:12,background:`rgba(${o.cl},.06)`,border:`1px solid rgba(${o.cl},.12)`,textAlign:"center",transition:"all .3s"}}>
              <div style={{fontSize:".95rem",color:`rgba(${o.cl},.85)`,marginBottom:3}}>{o.ic}</div>
              <div style={{fontSize:".68rem",fontWeight:600,color:`rgba(${o.cl},.75)`}}>{o.lb}</div>
            </div>)}
          </div>
        </div>
      </div>
      <style>{CSS}</style>
    </div>);
  }
  // ── NAV BAR ──
  const Nav=()=><div style={{position:"sticky",top:0,zIndex:50,background:"rgba(12,12,26,.85)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.bdr}`,padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <span onClick={()=>setPage(soul?"home":"input")} style={{cursor:"pointer",fontSize:"1rem",fontWeight:700,background:`linear-gradient(135deg,${C.gold},${C.rose})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>靈魂藍圖</span>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {[["home","首頁"],["ziwei","紫微"],["fortune","求籤"]].map(([id,l])=><button key={id} onClick={()=>setPage(id)} style={{padding:"4px 12px",borderRadius:12,fontSize:".7rem",background:page===id?"rgba(212,165,116,.12)":"transparent",color:page===id?C.gold:C.txt2,border:"none",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
    </div>
  </div>;

  // ── HOME PAGE ──
  if(page==="home"&&soul){
    const s=soul.syn;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}>
      <Stars/><Nav/>
      <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto",padding:"20px 16px 40px"}}>
        {/* MINI ORACLE ROW */}
        <div style={{display:"flex",gap:8,marginBottom:22}}>
          <div onClick={openFortune} style={{flex:1,cursor:"pointer",padding:"12px 8px",borderRadius:10,background:"rgba(212,165,116,.04)",border:"1px solid rgba(212,165,116,.1)",textAlign:"center",transition:"all .3s"}}>
            <div style={{fontSize:".9rem",color:C.gold,marginBottom:2,textShadow:"0 0 10px rgba(212,165,116,.2)"}}>☰</div>
            <div style={{fontSize:".65rem",fontWeight:600,color:C.gold}}>求籤</div>
          </div>
          <div onClick={openTarot} style={{flex:1,cursor:"pointer",padding:"12px 8px",borderRadius:10,background:"rgba(180,130,180,.04)",border:"1px solid rgba(180,130,180,.1)",textAlign:"center",transition:"all .3s"}}>
            <div style={{fontSize:".9rem",color:C.purp,marginBottom:2,textShadow:"0 0 10px rgba(180,130,180,.2)"}}>☽</div>
            <div style={{fontSize:".65rem",fontWeight:600,color:C.purp}}>塔羅</div>
          </div>
          <div onClick={openIChing} style={{flex:1,cursor:"pointer",padding:"12px 8px",borderRadius:10,background:"rgba(130,180,200,.04)",border:"1px solid rgba(130,180,200,.1)",textAlign:"center",transition:"all .3s"}}>
            <div style={{fontSize:".9rem",color:C.blue,marginBottom:2,textShadow:"0 0 10px rgba(130,180,200,.2)"}}>◎</div>
            <div style={{fontSize:".65rem",fontWeight:600,color:C.blue}}>易經</div>
          </div>
        </div>
        {/* SOUL SYNOPSIS */}
        <div style={{textAlign:"center",margin:"10px 0 20px"}}>
          <div style={{fontSize:"1.3rem",fontWeight:700,letterSpacing:".1em",color:"rgba(255,255,255,.9)"}}>✦ 靈魂共鳴解析 ✦</div>
          <div style={{fontSize:".78rem",color:C.txt2,marginTop:4}}>六大命理系統為你萃取的核心特質</div>
        </div>
        <Glass style={{marginBottom:14,padding:"20px 22px"}}>
          <div style={{fontSize:".82rem",color:C.gold,letterSpacing:".15em",marginBottom:10}}>✦ 天賦能量</div>
          <div style={{fontSize:".88rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{s.giftText}</div>
        </Glass>
        <Glass style={{marginBottom:14,padding:"20px 22px"}}>
          <div style={{fontSize:".82rem",color:C.rose,letterSpacing:".15em",marginBottom:10}}>☽ 近期宇宙指引</div>
          <div style={{fontSize:".88rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{s.cosmic}</div>
        </Glass>
        <Glass style={{marginBottom:20,padding:"20px 22px"}}>
          <div style={{fontSize:".82rem",color:C.purp,letterSpacing:".15em",marginBottom:10}}>✦ 人生課題</div>
          <div style={{fontSize:".88rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{s.shadow}</div>
        </Glass>
        {/* NAV CARDS */}
        <div style={{fontSize:".82rem",fontWeight:600,textAlign:"center",marginBottom:14,color:"rgba(255,255,255,.4)",letterSpacing:".12em"}}>── 深入探索各門派 ──</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {navCards.map(c=><Glass key={c.id} style={{cursor:"pointer",padding:"18px 20px",transition:"all .3s"}} onClick={()=>setPage(c.id)}>
            <div style={{fontSize:"1.2rem",marginBottom:8,color:C.gold,textShadow:"0 0 12px rgba(212,165,116,.2)"}}>{c.icon}</div>
            <div style={{fontSize:".9rem",fontWeight:700,color:C.gold,marginBottom:4}}>{c.title}</div>
            <div style={{fontSize:".75rem",color:"rgba(255,255,255,.45)",lineHeight:1.6}}>{c.sub}</div>
          </Glass>)}
        </div>
      </div>
      <style>{CSS}</style>
    </div>);
  }

  // ── ZIWEI DEEP ANALYSIS PAGE ──
  if(page==="ziwei"&&soul){
    const ch=soul.ziwei,cy=new Date().getFullYear(),curAge=cy-ch.bY;
    const ai=aiReading;/* null if not ready */
    const Shimmer=()=><div style={{display:"flex",flexDirection:"column",gap:6}}>{[100,80,90].map((w,i)=><div key={i} style={{height:12,width:`${w}%`,borderRadius:4,background:"linear-gradient(90deg,rgba(212,165,116,.04),rgba(212,165,116,.1),rgba(212,165,116,.04))",backgroundSize:"200% 100%",animation:"shimmer 1.5s ease-in-out infinite"}}/>)}</div>;
    const AiText=({text,fallback})=><div style={{fontSize:".85rem",lineHeight:1.9,color:"rgba(255,255,255,.6)"}}>{text||fallback||(aiLoading?<Shimmer/>:"載入中...")}</div>;
    /* ── Generate 大限 data ── */
    const dxList=[];const juStart=ch.ju.value;
    for(let i=0;i<7&&juStart+i*10<85;i++){
      const sa=juStart+i*10,ea=Math.min(sa+9,84);
      const sy=ch.bY+sa,ey=ch.bY+ea;
      /* palace for this 大限: cycle from 命宮 */
      const pIdx=(ch.lpp+i)%12;
      const p=ch.P.find(pp=>pp.bi===pIdx)||ch.P[i%12];
      const isCur=curAge>=sa&&curAge<=ea;
      /* score */
      const sc2=scoreP(p);
      const rating=sc2.close>=75?5:sc2.close>=60?4:sc2.close>=45?3:sc2.close>=30?2:1;
      /* find peak */
      const allStars=[...p.stars,...p.ls].join("・")||"空宮";
      const ushi=p.us.length>0?" ("+p.us.join("、")+")":"";
      /* desc based on stars */
      const mainStar=p.stars[0]||p.ls[0]||"空宮";
      const starDescs={"紫微":"帝星坐鎮，格局提升，領導力覺醒。","天機":"思維活躍，變動頻繁，適應力強。","太陽":"貴人運旺，社會地位提升，光明正大。","武曲":"財星發力，財務意識覺醒，務實進取。","天同":"心境平和，生活安逸，但容易缺乏衝勁。","廉貞":"桃花與事業並重，感情豐富但需管理情緒。","天府":"庫星守護，資源豐厚，穩中求進。","太陰":"財富累積期，直覺敏銳，適合深耕。","貪狼":"慾望驅動力強，社交活躍，多元發展。","巨門":"口才突出但口舌是非多，需謹言慎行。","天相":"貴人相助，適合合作，考試簽約有利。","天梁":"化險為夷的能力強，適合擔任顧問角色。","七殺":"衝勁十足，開創格局，但壓力也大。","破軍":"大破大立，變動劇烈，勇於重新開始。"};
      const desc=`${starDescs[mainStar]||"此時期能量平穩，適合自我調整。"}${p.us.length>0?"煞星"+p.us.join("、")+"帶來考驗，但磨練出真功夫。":""}${p.sh.filter(s=>s.name==="化祿").length>0?"化祿加持帶來好運與資源。":""}${p.sh.filter(s=>s.name==="化忌").length>0?"化忌提醒此階段需特別留心相關領域。":""}`;
      dxList.push({sa,ea,sy,ey,palace:PN[ch.P.indexOf(p)]||PN[i%12],branch:BR[pIdx],stars:allStars+ushi,rating,desc,isCur,score:sc2.close,pIdx});
    }
    const peakDx=dxList.reduce((a,b)=>a.score>b.score?a:b,dxList[0]);
    peakDx.isPeak=true;
    /* ── Generate 流年 data ── */
    const lyYsi=((cy-4)%10+10)%10,lyYbi=((cy-4)%12+12)%12;
    const lySH=SHT[lyYsi];
    const lyAge=curAge;
    /* flow year palace = cycle based on age */
    const lyPIdx=(ch.lpp+(lyAge-juStart))%12;
    const lyP=ch.P.find(pp=>pp.bi===lyPIdx)||ch.P[0];
    const lySc=scoreP(lyP);
    const lyRating=lySc.close>=75?5:lySc.close>=60?4:lySc.close>=45?3:lySc.close>=30?2:1;
    /* sections for 流年 */
    const dimNames=["總運","事業運","財運","感情","健康"];
    const dimPals=[0,8,4,2,5];/* 命,事業,財帛,夫妻,疾厄 palace indices in PN */
    const dimIcons=["◎","⚡","◈","♢","○"];
    const lySections=dimNames.map((dn,di)=>{
      const dpi=dimPals[di];const dp=ch.P[dpi];const dsc=scoreP(dp);
      const dr=dsc.close>=75?5:dsc.close>=60?4:dsc.close>=45?3:dsc.close>=30?2:1;
      const mainS=dp.stars[0]||dp.ls[0]||"";
      const hasLu=dp.sh.some(s=>s.name==="化祿"),hasJi=dp.sh.some(s=>s.name==="化忌");
      const descs={"總運":{good:"整體能量充沛，適合主動出擊，把握機遇。",mid:"整體運勢平穩，穩中求進是最佳策略。",low:"整體需要韜光養晦，保存實力等待轉機。"},"事業運":{good:"事業星光熠熠，適合大膽推進重要專案。專業能力會被看見。",mid:"事業穩步推進，適合精進技術、累積專業深度。",low:"事業壓力較大，建議穩住腳步，不宜冒進。"},"財運":{good:"正財偏財皆有利，把握機會積極理財。",mid:"正財穩健，建議以穩健投資為主，避免投機。",low:"財務上需謹慎，避免大額支出和高風險投資。"},"感情":{good:"桃花旺盛，人際關係和諧，適合深化重要關係。",mid:"感情平順，重要的是維持良好溝通。",low:"感情上容易有誤會或摩擦，需要更多耐心與包容。"},"健康":{good:"身體能量充足，適合加強鍛鍊。",mid:"健康尚可，注意作息規律和飲食均衡。",low:"需要特別關注身體訊號，避免過度勞累。"}};
      const lvl=dr>=4?"good":dr>=3?"mid":"low";
      let content=descs[dn]?.[lvl]||"平穩期。";
      if(hasLu)content+=`${lySH[0]}化祿加持此宮，帶來助力。`;
      if(hasJi)content+=`注意${lySH[3]}化忌的影響，相關事務需多留心。`;
      return{title:dn,icon:dimIcons[di],rating:dr,content};
    });
    /* quarterly */
    const lyQuarterly=[1,2,3,4].map(q=>{
      const mStart=(q-1)*3+1,mEnd=q*3;
      const qh=hs(ch.ysi,q,lyYsi,ch.zwp);
      const qr=qh>.7?4.5:qh>.5?3.5:qh>.3?3:2.5;
      const qNotes=["開局佈陣期，適合規劃與拓展人脈。","中段發力期，把握機會推進重要事項。","沉澱整理期，適合盤點資源、優化方向。","收尾蓄力期，回顧成果、為來年佈局。"];
      return{q:`Q${q}（農曆${mStart}-${mEnd}月）`,rating:qr,note:qNotes[q-1]};
    });
    /* ── Timeline for 大運何時來 ── */
    const timeline=[];
    dxList.forEach((dx,i)=>{
      const isPast=curAge>dx.ea;const isFut=curAge<dx.sa;
      timeline.push({year:`${dx.sy}-${dx.ey}`,age:`${dx.sa}-${dx.ea}歲`,label:dx.isPeak?"★ 黃金大運":dx.isCur?"當前大限":isPast?"已走過":"未來大限",desc:`${dx.palace}（${dx.branch}）・${dx.stars}`,dot:dx.isPeak?"#f0c040":dx.isCur?C.gold:isPast?"rgba(200,170,100,.25)":"rgba(130,180,200,.5)",isPeak:dx.isPeak,isCur:dx.isCur,isPast,rating:dx.rating});
    });
    /* StarRating inline */
    const SR=({r})=><div style={{display:"flex",gap:3}}>{Array.from({length:5},(_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i<Math.floor(r)?C.gold:i<r?`linear-gradient(90deg,${C.gold} 50%,rgba(212,165,116,.15) 50%)`:"rgba(212,165,116,.15)",border:"1px solid rgba(212,165,116,.2)"}}/>)}</div>;

    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{position:"relative",zIndex:1,maxWidth:600,margin:"0 auto",padding:"16px 14px 40px"}}>
        <PB icon="☰" title="紫微斗數"/>
        {/* Tab bar */}
        <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid rgba(212,165,116,.12)",position:"sticky",top:48,background:C.bg,zIndex:10,paddingTop:4}}>
          {[`${cy}流年`,`十年大限`,`大運何時來`].map((t,i)=><button key={i} onClick={()=>setZwTab(i)} style={{flex:1,padding:"10px 0",border:"none",background:"none",color:zwTab===i?C.gold:"rgba(212,165,116,.45)",fontSize:".82rem",fontWeight:zwTab===i?700:400,fontFamily:"inherit",cursor:"pointer",borderBottom:zwTab===i?`2px solid ${C.gold}`:"2px solid transparent",transition:"all .2s",letterSpacing:".08em"}}>{t}</button>)}
        </div>

        {/* ═══ TAB 0: 流年分析 ═══ */}
        {zwTab===0&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{textAlign:"center",padding:"16px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.4)",letterSpacing:".2em",marginBottom:4}}>流年命盤</div>
            <div style={{fontSize:"1.35rem",fontWeight:700,color:C.gold,letterSpacing:".2em"}}>{ST[lyYsi]}{BR[lyYbi]}年（{cy}）</div>
            <div style={{fontSize:".75rem",color:"rgba(212,165,116,.45)",marginTop:4}}>虛歲{lyAge+1} ・ 流年命宮{BR[lyPIdx]}</div>
            <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
              {[{s:lySH[0],h:"化祿",c:C.gold},{s:lySH[1],h:"化權",c:C.rose},{s:lySH[2],h:"化科",c:C.blue},{s:lySH[3],h:"化忌",c:"rgba(180,130,130,.7)"}].map((h,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:".9rem",fontWeight:700,color:h.c}}>{h.s}</div><div style={{fontSize:".6rem",color:"rgba(212,165,116,.3)"}}>{h.h}</div></div>)}
            </div>
          </div>
          {lySections.map((s,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(212,165,116,.02)",border:"1px solid rgba(212,165,116,.08)",borderRadius:8,cursor:"default"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:C.gold,fontSize:".9rem"}}>{s.icon}</span>
                <span style={{color:"rgba(255,255,255,.85)",fontSize:".9rem",fontWeight:600,letterSpacing:".05em"}}>{s.title}</span>
              </div>
              <SR r={s.rating}/>
            </div>
            <AiText text={ai?.liuNian?.[["overall","career","wealth","love","health"][i]]} fallback={s.content}/>
          </div>)}
          {/* Quarterly */}
          <div style={{marginTop:4,padding:"12px 0",borderTop:"1px solid rgba(212,165,116,.08)"}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.3)",letterSpacing:".15em",marginBottom:10,textAlign:"center"}}>季度運勢節奏</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {lyQuarterly.map((q,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 10px",background:"rgba(212,165,116,.02)",borderRadius:6,border:"1px solid rgba(212,165,116,.05)"}}>
                <div style={{minWidth:90}}>
                  <div style={{fontSize:".75rem",color:C.gold,fontWeight:600}}>{q.q}</div>
                  <div style={{marginTop:3}}><SR r={q.rating}/></div>
                </div>
                <div style={{fontSize:".78rem",color:"rgba(255,255,255,.5)",lineHeight:1.7}}>{ai?.liuNian?.quarterly?.[i]||q.note}</div>
              </div>)}
            </div>
          </div>
        </div>}

        {/* ═══ TAB 1: 十年大限 ═══ */}
        {zwTab===1&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{textAlign:"center",padding:"12px 0",borderBottom:"1px solid rgba(212,165,116,.08)",marginBottom:4}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.3)",letterSpacing:".2em",marginBottom:4}}>{ch.ju.name}・{gen==="male"?"陽男":"陰女"}</div>
            <div style={{fontSize:"1.15rem",fontWeight:700,color:C.gold,letterSpacing:".15em"}}>十年大限走勢</div>
          </div>
          {dxList.map((dx,i)=><div key={i} style={{padding:"14px 16px",background:dx.isCur?"rgba(212,165,116,.06)":dx.isPeak?"rgba(240,192,64,.04)":"rgba(212,165,116,.02)",border:dx.isPeak?"1px solid rgba(240,192,64,.25)":dx.isCur?`1px solid rgba(212,165,116,.18)`:"1px solid rgba(212,165,116,.06)",borderRadius:8,position:"relative"}}>
            {dx.isCur&&<div style={{position:"absolute",top:8,right:10,fontSize:".6rem",color:C.gold,background:"rgba(212,165,116,.12)",padding:"2px 8px",borderRadius:4,fontWeight:700,letterSpacing:".05em"}}>← 現在</div>}
            {dx.isPeak&&<div style={{position:"absolute",top:8,right:10,fontSize:".6rem",color:"#1a1428",background:C.gold,padding:"2px 8px",borderRadius:4,fontWeight:700,letterSpacing:".05em"}}>★ 黃金大運</div>}
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{minWidth:52}}>
                <div style={{fontSize:"1rem",fontWeight:700,color:"rgba(255,255,255,.85)"}}>{dx.sa}-{dx.ea}歲</div>
                <div style={{fontSize:".6rem",color:"rgba(212,165,116,.35)",marginTop:2}}>{dx.sy}-{dx.ey}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:".82rem",color:C.gold,fontWeight:600,marginBottom:3}}>{dx.palace}（{dx.branch}宮）</div>
                <div style={{fontSize:".75rem",color:"rgba(130,200,160,.65)",marginBottom:4}}>{dx.stars}</div>
                <div style={{marginBottom:6}}><SR r={dx.rating}/></div>
                <div style={{fontSize:".78rem",color:"rgba(255,255,255,.5)",lineHeight:1.8}}>{ai?.daXian?.[i]||dx.desc}</div>
              </div>
            </div>
          </div>)}
        </div>}

        {/* ═══ TAB 2: 大運何時來 ═══ */}
        {zwTab===2&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{textAlign:"center",padding:"20px 0 16px",borderBottom:"1px solid rgba(212,165,116,.08)"}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.3)",letterSpacing:".2em",marginBottom:8}}>命運時間軸</div>
            <div style={{fontSize:"1.2rem",fontWeight:700,color:C.gold,letterSpacing:".2em"}}>大運何時來？</div>
          </div>
          <div style={{padding:"0 8px"}}>
            <div style={{position:"relative",paddingLeft:20}}>
              <div style={{position:"absolute",left:6,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,rgba(212,165,116,.1),rgba(212,165,116,.3),rgba(240,192,64,.7),rgba(212,165,116,.15))"}}/>
              {timeline.map((nd,i)=><div key={i} style={{position:"relative",paddingLeft:16,paddingBottom:22,opacity:nd.isPast?.45:1}}>
                <div style={{position:"absolute",left:-17,top:4,width:nd.isPeak||nd.isCur?14:10,height:nd.isPeak||nd.isCur?14:10,borderRadius:"50%",background:nd.dot,border:nd.isPeak?"2px solid rgba(240,192,64,.4)":"none",boxShadow:nd.isPeak?"0 0 12px rgba(240,192,64,.3)":"none"}}/>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:".75rem",color:nd.isPeak?"#f0c040":nd.isCur?C.gold:"rgba(212,165,116,.45)",fontWeight:600}}>{nd.year}</div>
                    <div style={{fontSize:".6rem",color:"rgba(212,165,116,.3)"}}>{nd.age}</div>
                  </div>
                  <div>
                    <div style={{fontSize:".88rem",fontWeight:700,color:nd.isPeak?"#f0c040":"rgba(255,255,255,.85)",marginBottom:3}}>{nd.label}</div>
                    <div style={{fontSize:".75rem",color:"rgba(255,255,255,.45)",lineHeight:1.8}}>{nd.desc}</div>
                    <div style={{marginTop:4}}><SR r={nd.rating}/></div>
                  </div>
                </div>
              </div>)}
            </div>
          </div>
          {/* Summary */}
          <div style={{margin:"4px 0",padding:16,background:"rgba(240,192,64,.04)",border:"1px solid rgba(240,192,64,.15)",borderRadius:8}}>
            <div style={{fontSize:".88rem",fontWeight:700,color:"#f0c040",marginBottom:8,letterSpacing:".05em"}}>結論</div>
            <div style={{fontSize:".85rem",color:"rgba(255,255,255,.6)",lineHeight:2}}>
              {ai?.peak||<>你的黃金大運在 <strong style={{color:"#f0c040"}}>{peakDx.sa}歲（{peakDx.sy}年）</strong>正式啟動。{peakDx.isCur?"恭喜你，現在就是你最好的時候！全力以赴吧。":`現在是「蓄力期」——${dxList.find(d=>d.isCur)?"當前"+dxList.find(d=>d.isCur).palace+"大限正在磨練你的實力，":""}每一步都在為未來的爆發鋪路。把專業做到極致、把人脈經營好，時候到了一切會自然匯流。`}</>}
            </div>
          </div>
        </div>}
      </div>
      <style>{CSS}</style>
    </div>);
  }
  // ── ZODIAC PAGE ──
  if(page==="zodiac"&&soul){
    const z=ZT[soul.zodiac]||ZT["牡羊座"];
    const vals=[75,60,80,55,70,65].map((v,i)=>Math.max(20,Math.min(95,v+Math.round((hs(soul.bazi.ysi,v,i,1)-.5)*30))));
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="✦" title="星座解析"/>
        <Glass style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:"2.2rem",marginBottom:6,color:C.gold,textShadow:"0 0 20px rgba(212,165,116,.3)"}}>{{"火":"△","水":"▽","土":"◇","風":"○"}[z.el]||"✦"}</div>
          <div style={{fontSize:"1.4rem",fontWeight:700,color:C.gold,marginBottom:4}}>{soul.zodiac}</div>
          <div style={{fontSize:".78rem",color:C.txt2}}>元素：{z.el} ｜ 能量模式：{z.en}</div>
        </Glass>
        <Glass style={{marginBottom:14}}>
          <div style={{fontSize:".82rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 核心特質</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{z.tr.map((t,i)=><span key={i} style={{padding:"6px 16px",borderRadius:20,background:`${C.gold}11`,border:`1px solid ${C.gold}33`,fontSize:".78rem",color:C.gold}}>{t}</span>)}</div>
          <div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>你是擁有「{z.en}」能量的{z.el}象星座。{z.tr.join("、")}——這些天賦讓你獨特而閃耀。</div>
        </Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>❖ 感情解析</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)",marginBottom:10}}>{z.love}</div>{z.compat&&<div style={{fontSize:".78rem",color:C.txt2}}>最佳靈魂伴侶：{z.compat.map((c,i)=><span key={i} style={{display:"inline-block",margin:"2px 4px",padding:"3px 10px",borderRadius:12,background:`${C.rose}11`,border:`1px solid ${C.rose}33`,fontSize:".72rem",color:C.rose}}>{c}</span>)}</div>}</Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.blue,letterSpacing:".12em",marginBottom:10}}>✦ 事業天賦</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{z.career}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:"#8bc8a0",letterSpacing:".12em",marginBottom:10}}>◇ 健康提醒</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{z.health}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.purp,letterSpacing:".12em",marginBottom:10}}>✦ 靈魂課題</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{z.sh}——這不是缺點，而是你此生的修煉方向。擁抱它，它會成為你最大的力量。</div></Glass>
        <Glass style={{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center"}}><div style={{fontSize:".82rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 能量雷達圖</div><Radar labels={["事業","財運","感情","健康","人緣","靈性"]} values={vals} size={240}/></Glass>
      </div><style>{CSS}</style>
    </div>);
  }
  // ── LIFE PATH PAGE ──
  if(page==="lifepath"&&soul){
    const lp=soul.lpd;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="☽" title="生命靈數"/>
        <Glass style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:"3.5rem",fontWeight:900,background:`linear-gradient(135deg,${C.gold},${C.rose})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4,lineHeight:1.2}}>{soul.lp}</div><div style={{fontSize:"1.15rem",fontWeight:700,color:C.gold,marginBottom:6}}>{lp.t}</div><div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>{lp.g.map((g,i)=><span key={i} style={{padding:"5px 14px",borderRadius:20,background:`${C.purp}15`,border:`1px solid ${C.purp}33`,fontSize:".76rem",color:C.purp}}>{g}</span>)}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 靈魂藍圖</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{lp.d}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>❖ 感情與關係</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{lp.love}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.blue,letterSpacing:".12em",marginBottom:10}}>✦ 事業與財富</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{lp.career}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.purp,letterSpacing:".12em",marginBottom:10}}>✦ 人生核心課題</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{lp.ch}</div></Glass>
        <Glass style={{marginBottom:14}}>
          <div style={{fontSize:".82rem",color:C.gold,letterSpacing:".12em",marginBottom:12}}>◎ 號碼相性</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{padding:12,borderRadius:10,background:`${C.gold}08`}}><div style={{fontSize:".68rem",color:C.txt2,marginBottom:6}}>最佳夥伴號碼</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{lp.best.map(n=><span key={n} style={{width:32,height:32,borderRadius:16,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:".9rem",fontWeight:700,background:`${C.gold}22`,border:`1px solid ${C.gold}44`,color:C.gold}}>{n}</span>)}</div></div>
            <div style={{padding:12,borderRadius:10,background:`${C.rose}08`}}><div style={{fontSize:".68rem",color:C.txt2,marginBottom:6}}>❖ 最佳戀人號碼</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:36,height:36,borderRadius:18,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",fontWeight:900,background:`${C.rose}22`,border:`1px solid ${C.rose}44`,color:C.rose}}>{lp.lover}</span><span style={{fontSize:".75rem",color:C.txt2}}>{LPD[lp.lover]?.t||""}</span></div></div>
          </div>
        </Glass>
      </div><style>{CSS}</style>
    </div>);
  }
  // ── HUMAN DESIGN PAGE ──
  if(page==="humandesign"&&soul){
    const h=soul.hd,cy=new Date().getFullYear(),curAge=cy-(soul.ziwei?.bY||1996);
    const isDef=(k)=>h.definedCenters.has(k);
    const centerPos={head:{x:150,y:36},ajna:{x:150,y:92},throat:{x:150,y:156},g:{x:150,y:228},will:{x:216,y:245},sacral:{x:150,y:316},spleen:{x:78,y:296},emo:{x:222,y:316},root:{x:150,y:400}};
    const sz2=28;
    const BG=()=>{
      const shapes={head:"tri_up",ajna:"tri_dn",throat:"sq",g:"dia",will:"tri_r",sacral:"sq",spleen:"tri_l",emo:"tri_r",root:"sq"};
      const renderCenter=(key)=>{const c=centerPos[key];const df=isDef(key);const fill=df?"rgba(200,170,100,.2)":"rgba(200,170,100,.04)";const stroke=df?"#c8a43c":"rgba(200,170,100,.15)";const sw=df?1.5:.8;
        let el;const sh=shapes[key];
        if(sh==="sq")el=<rect x={c.x-sz2/2} y={c.y-sz2/2} width={sz2} height={sz2} rx={3} fill={fill} stroke={stroke} strokeWidth={sw}/>;
        else if(sh==="dia"){const p=`${c.x},${c.y-sz2/2} ${c.x+sz2/2},${c.y} ${c.x},${c.y+sz2/2} ${c.x-sz2/2},${c.y}`;el=<polygon points={p} fill={fill} stroke={stroke} strokeWidth={sw}/>}
        else if(sh==="tri_up"){const p=`${c.x},${c.y-sz2/2} ${c.x+sz2/2},${c.y+sz2/2} ${c.x-sz2/2},${c.y+sz2/2}`;el=<polygon points={p} fill={fill} stroke={stroke} strokeWidth={sw}/>}
        else if(sh==="tri_dn"){const p=`${c.x-sz2/2},${c.y-sz2/2} ${c.x+sz2/2},${c.y-sz2/2} ${c.x},${c.y+sz2/2}`;el=<polygon points={p} fill={fill} stroke={stroke} strokeWidth={sw}/>}
        else if(sh==="tri_r"){const p=`${c.x-sz2/2},${c.y-sz2/2} ${c.x-sz2/2},${c.y+sz2/2} ${c.x+sz2/2},${c.y}`;el=<polygon points={p} fill={fill} stroke={stroke} strokeWidth={sw}/>}
        else{const p=`${c.x+sz2/2},${c.y-sz2/2} ${c.x+sz2/2},${c.y+sz2/2} ${c.x-sz2/2},${c.y}`;el=<polygon points={p} fill={fill} stroke={stroke} strokeWidth={sw}/>}
        return <g key={key}>{el}<text x={c.x} y={c.y-sz2/2-6} textAnchor="middle" fontSize={7} fill={df?"#c8a43c":"rgba(200,170,100,.25)"} fontWeight={df?700:400}>{HD_CN[key]}</text></g>};
      const dormant=HD_CHANNELS.filter(ch=>!h.activeChannels.find(ac=>ac.g1===ch[0]&&ac.g2===ch[1])).map((ch,i)=>{const p1=centerPos[ch[2]],p2=centerPos[ch[3]];return p1&&p2?<line key={`d${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(200,170,100,.04)" strokeWidth={1}/>:null});
      const active=h.activeChannels.map((ch,i)=>{const p1=centerPos[ch.c1],p2=centerPos[ch.c2];return p1&&p2?<line key={`a${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(200,170,100,.55)" strokeWidth={2.5} strokeLinecap="round"/>:null});
      return <svg viewBox="0 0 300 440" style={{width:"100%",maxWidth:280}}>{dormant}{active}{h.centerOrder.map(renderCenter)}</svg>};
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{position:"relative",zIndex:1,maxWidth:600,margin:"0 auto",padding:"16px 14px 40px"}}>
        <PB icon="⚡" title="人類圖"/>
        <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid rgba(212,165,116,.12)",position:"sticky",top:48,background:C.bg,zIndex:10,paddingTop:4}}>
          {["身體圖","類型策略","通道閘門","能量中心"].map((t,i)=><button key={i} onClick={()=>{setHdTab(i);setHdSelCh(null);setHdGateOpen(null)}} style={{flex:1,padding:"10px 0",border:"none",background:"none",color:hdTab===i?C.gold:"rgba(212,165,116,.4)",fontSize:".75rem",fontWeight:hdTab===i?700:400,fontFamily:"inherit",cursor:"pointer",borderBottom:hdTab===i?`2px solid ${C.gold}`:"2px solid transparent"}}>{t}</button>)}
        </div>
        {/* TAB 0: 身體圖 */}
        {hdTab===0&&<div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
          <div style={{textAlign:"center",padding:"8px 0"}}><div style={{fontSize:".62rem",color:"rgba(212,165,116,.3)",letterSpacing:".2em",marginBottom:4}}>HUMAN DESIGN BODYGRAPH</div><div style={{fontSize:"1.2rem",fontWeight:700,color:C.gold}}>{h.type}</div><div style={{fontSize:".68rem",color:C.txt2,marginTop:4}}>{h.activeChannels.length} 通道 · {h.definedCenters.size} 中心 · {Object.keys(h.gateDetails).length} 閘門</div></div>
          <BG/>
          <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{padding:10,borderRadius:6,border:"1px solid rgba(212,165,116,.06)"}}><div style={{fontSize:".6rem",color:"rgba(212,165,116,.3)",marginBottom:6}}>有定義中心</div>{[...h.definedCenters].map(k=><div key={k} style={{fontSize:".72rem",color:C.gold,marginBottom:2}}>{HD_CN[k]}</div>)}{h.definedCenters.size===0&&<div style={{fontSize:".68rem",color:"rgba(212,165,116,.2)"}}>無（反映者）</div>}</div>
            <div style={{padding:10,borderRadius:6,border:"1px solid rgba(212,165,116,.06)"}}><div style={{fontSize:".6rem",color:"rgba(212,165,116,.3)",marginBottom:6}}>開放中心</div>{h.centerOrder.filter(k=>!isDef(k)).map(k=><div key={k} style={{fontSize:".72rem",color:"rgba(212,165,116,.3)",marginBottom:2}}>{HD_CN[k]}</div>)}</div>
          </div>
          <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{padding:10,borderRadius:6,border:"1px solid rgba(40,40,40,.3)",borderLeft:"3px solid #555"}}><div style={{fontSize:".58rem",color:"rgba(212,165,116,.3)",marginBottom:6}}>☀ 個性面（意識）</div>{h.pGates.slice(0,6).map((g,i)=><div key={i} style={{fontSize:".68rem",color:"rgba(255,255,255,.5)",marginBottom:2,display:"flex",justifyContent:"space-between"}}><span>{g.planet}</span><span style={{color:C.gold}}>閘門{g.gate}.{g.line}</span></div>)}</div>
            <div style={{padding:10,borderRadius:6,border:"1px solid rgba(40,40,40,.3)",borderLeft:"3px solid #e06848"}}><div style={{fontSize:".58rem",color:"rgba(224,104,72,.5)",marginBottom:6}}>☽ 設計面（潛意識）</div>{h.dGates.slice(0,6).map((g,i)=><div key={i} style={{fontSize:".68rem",color:"rgba(255,255,255,.5)",marginBottom:2,display:"flex",justifyContent:"space-between"}}><span>{g.planet}</span><span style={{color:"#e06848"}}>閘門{g.gate}.{g.line}</span></div>)}</div>
          </div>
        </div>}
        {/* TAB 1: 類型策略 */}
        {hdTab===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{textAlign:"center",padding:"16px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}><div style={{fontSize:"1.4rem",fontWeight:700,color:"#e06848"}}>{h.type}</div><div style={{fontSize:".7rem",color:C.txt2,marginTop:4}}>{h.pct} 的人口</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{l:"策略",v:h.st,c:C.gold},{l:"內在權威",v:h.auth,c:"#e06848"},{l:"人生角色",v:h.def,c:C.blue},{l:"非自己主題",v:h.notSelf,c:"#d45a3a"},{l:"人生簽名",v:h.sig,c:"#5ca868"},{l:"輪迴十字",v:h.cross,c:C.purp}].map((p,i)=><div key={i} style={{padding:10,borderRadius:6,border:"1px solid rgba(212,165,116,.06)"}}><div style={{fontSize:".58rem",color:"rgba(212,165,116,.3)",marginBottom:4}}>{p.l}</div><div style={{fontSize:".78rem",color:p.c,fontWeight:600}}>{p.v}</div></div>)}
          </div>
          <div style={{padding:14,borderRadius:8,background:"rgba(224,104,72,.03)",border:"1px solid rgba(224,104,72,.1)"}}><div style={{fontSize:".88rem",fontWeight:700,color:"#e06848",marginBottom:6}}>如何做正確的決定</div><div style={{fontSize:".82rem",color:"rgba(255,255,255,.55)",lineHeight:1.9}}>{h.tips}</div></div>
          <div style={{padding:14,borderRadius:8,border:"1px solid rgba(212,165,116,.06)"}}><div style={{fontSize:".82rem",fontWeight:600,color:"rgba(255,255,255,.7)",marginBottom:6}}>你的人類圖藍圖</div><div style={{fontSize:".85rem",color:"rgba(255,255,255,.55)",lineHeight:1.9}}>{h.desc}</div></div>
          <div style={{padding:14,borderRadius:8,border:"1px solid rgba(212,165,116,.06)"}}><div style={{fontSize:".82rem",fontWeight:600,color:"rgba(255,255,255,.7)",marginBottom:6}}>能量運作方式</div><div style={{fontSize:".85rem",color:"rgba(255,255,255,.55)",lineHeight:1.9}}>{h.energy}</div></div>
        </div>}
        {/* TAB 2: 通道與閘門 */}
        {hdTab===2&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{textAlign:"center",padding:"12px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}><div style={{fontSize:"1.1rem",fontWeight:700,color:C.gold}}>{h.activeChannels.length} 條有定義通道</div><div style={{fontSize:".65rem",color:C.txt2,marginTop:4}}>{Object.keys(h.gateDetails).length} / 64 閘門已活化</div></div>
          {h.activeChannels.length>0&&<div style={{fontSize:".65rem",color:"rgba(212,165,116,.3)",letterSpacing:".1em"}}>有定義通道</div>}
          {h.activeChannels.map((ch,i)=><div key={i} onClick={()=>setHdSelCh(hdSelCh===i?null:i)} style={{padding:"12px 14px",borderRadius:6,border:hdSelCh===i?"1px solid rgba(212,165,116,.25)":"1px solid rgba(212,165,116,.06)",borderLeft:`3px solid ${C.gold}`,background:hdSelCh===i?"rgba(212,165,116,.04)":"transparent",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span style={{fontSize:".88rem",fontWeight:700,color:"rgba(255,255,255,.85)"}}>{ch.name}</span><span style={{fontSize:".65rem",color:C.txt2,marginLeft:8}}>閘門{ch.g1}—{ch.g2}</span></div><span style={{fontSize:".58rem",color:C.txt2}}>{HD_CN[ch.c1]}↔{HD_CN[ch.c2]}</span></div>
            <div style={{fontSize:".7rem",color:"rgba(212,165,116,.5)",marginTop:3}}>{ch.keynote}</div>
            {hdSelCh===i&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(212,165,116,.06)",fontSize:".8rem",color:"rgba(255,255,255,.55)",lineHeight:1.9}}>{ch.desc}</div>}
          </div>)}
          {h.activeChannels.length===0&&<div style={{padding:20,textAlign:"center",fontSize:".8rem",color:"rgba(212,165,116,.25)"}}>沒有完整通道——你是反映者</div>}
          <div style={{fontSize:".65rem",color:"rgba(212,165,116,.3)",letterSpacing:".1em",marginTop:12}}>已活化閘門（{Object.keys(h.gateDetails).length}）</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:6}}>
            {Object.values(h.gateDetails).sort((a,b)=>a.num-b.num).map(g=>{const isP=g.activations.some(a=>a.type==="personality"),isD=g.activations.some(a=>a.type==="design");
              return <div key={g.num} onClick={()=>setHdGateOpen(hdGateOpen===g.num?null:g.num)} style={{padding:"7px 9px",borderRadius:5,border:"1px solid rgba(212,165,116,.08)",cursor:"pointer",background:hdGateOpen===g.num?"rgba(212,165,116,.06)":"transparent"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:".85rem",fontWeight:700,color:C.gold}}>{g.num}</span><div style={{display:"flex",gap:2}}>{isP&&<div style={{width:5,height:5,borderRadius:3,background:"#555"}}/>}{isD&&<div style={{width:5,height:5,borderRadius:3,background:"#e06848"}}/>}</div></div>
                <div style={{fontSize:".58rem",color:"rgba(255,255,255,.35)",marginTop:2}}>{g.n}</div>
              </div>})}
          </div>
          {hdGateOpen&&h.gateDetails[hdGateOpen]&&<div style={{padding:14,borderRadius:8,background:"rgba(212,165,116,.04)",border:"1px solid rgba(212,165,116,.15)",marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><span style={{fontSize:"1.1rem",fontWeight:700,color:C.gold}}>閘門 {hdGateOpen}</span><span style={{fontSize:".78rem",color:C.txt2,marginLeft:8}}>{h.gateDetails[hdGateOpen].n}</span></div><span style={{fontSize:".6rem",color:"rgba(212,165,116,.4)",padding:"2px 8px",borderRadius:4,background:"rgba(212,165,116,.08)"}}>{HD_CN[h.gateDetails[hdGateOpen].c]}</span></div>
            <div style={{fontSize:".7rem",color:C.gold,marginBottom:6}}>關鍵詞：{h.gateDetails[hdGateOpen].k}</div>
            <div style={{fontSize:".82rem",color:"rgba(255,255,255,.55)",lineHeight:1.9}}>{h.gateDetails[hdGateOpen].d}</div>
            <div style={{marginTop:8,display:"flex",gap:5,flexWrap:"wrap"}}>{h.gateDetails[hdGateOpen].activations.map((a,i)=><span key={i} style={{fontSize:".6rem",padding:"3px 7px",borderRadius:4,background:a.type==="personality"?"rgba(50,50,50,.5)":"rgba(224,104,72,.15)",color:a.type==="personality"?"rgba(255,255,255,.5)":"#e06848",border:`1px solid ${a.type==="personality"?"rgba(80,80,80,.3)":"rgba(224,104,72,.2)"}`}}>{a.type==="personality"?"☀":"☽"} {a.planet}·爻{a.line}</span>)}</div>
          </div>}
        </div>}
        {/* TAB 3: 能量中心 */}
        {hdTab===3&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{textAlign:"center",padding:"12px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}><div style={{fontSize:"1.1rem",fontWeight:700,color:C.gold}}>9 大能量中心</div><div style={{fontSize:".65rem",color:C.txt2,marginTop:4}}>{h.definedCenters.size} 有定義 · {9-h.definedCenters.size} 開放</div></div>
          {h.centers.map((ctr,i)=><div key={i} style={{padding:"14px 16px",borderRadius:8,border:ctr.defined?"1px solid rgba(200,170,100,.2)":"1px solid rgba(212,165,116,.06)",background:ctr.defined?"rgba(200,170,100,.03)":"transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div><span style={{fontSize:".9rem",fontWeight:700,color:ctr.defined?C.gold:"rgba(212,165,116,.4)"}}>{ctr.name}</span><span style={{fontSize:".58rem",marginLeft:8,padding:"2px 8px",borderRadius:4,background:ctr.defined?"rgba(200,170,100,.15)":"rgba(212,165,116,.04)",color:ctr.defined?C.gold:"rgba(212,165,116,.3)"}}>{ctr.defined?"有定義":"開放"}</span></div>
              <span style={{fontSize:".58rem",color:"rgba(212,165,116,.3)"}}>{ctr.theme.bio}</span>
            </div>
            <div style={{fontSize:".8rem",color:"rgba(255,255,255,.55)",lineHeight:1.8,marginBottom:ctr.gates.length>0?8:0}}>{ctr.defined?ctr.theme.def:ctr.theme.undef}</div>
            {ctr.gates.length>0&&<div style={{paddingTop:8,borderTop:"1px solid rgba(212,165,116,.05)"}}><div style={{fontSize:".58rem",color:"rgba(212,165,116,.25)",marginBottom:4}}>活化閘門</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{ctr.gates.map(g=><span key={g.num} style={{fontSize:".65rem",padding:"3px 7px",borderRadius:4,background:"rgba(212,165,116,.06)",color:"rgba(212,165,116,.6)",border:"1px solid rgba(212,165,116,.1)"}}>G{g.num} {g.n}</span>)}</div></div>}
            {ctr.channels.length>0&&<div style={{paddingTop:6}}><div style={{fontSize:".58rem",color:"rgba(212,165,116,.25)",marginBottom:4}}>通過此中心的通道</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{ctr.channels.map((ch,j)=><span key={j} style={{fontSize:".65rem",padding:"3px 7px",borderRadius:4,background:"rgba(200,170,100,.08)",color:C.gold,border:"1px solid rgba(200,170,100,.12)"}}>{ch.name}</span>)}</div></div>}
          </div>)}
        </div>}
      </div>
      <style>{CSS}</style>
    </div>);
  }
  // ── MAYAN PAGE ──
  if(page==="mayan"&&soul){
    const m=soul.mayan;const md=m.d||{};
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="◎" title="瑪雅曆"/>
        <Glass style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:"2.2rem",marginBottom:8,color:C.gold,textShadow:"0 0 20px rgba(212,165,116,.3)"}}>◎</div>
          <div style={{fontSize:"1.2rem",fontWeight:700,color:C.gold}}>{m.tone} · {m.seal}</div>
          <div style={{fontSize:".78rem",color:C.txt2,marginTop:4}}>Kin {m.kin} ｜ 調性能量：{m.td}</div>
        </Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".82rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 星系印記：{md.c||""}</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>你的本質是「{md.d||m.seal}」。{md.g||""}</div></Glass>
        <Glass style={{marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{padding:12,borderRadius:10,background:`${C.gold}08`}}><div style={{fontSize:".68rem",color:C.txt2,marginBottom:4}}>超能力</div><div style={{fontSize:".88rem",color:C.gold,fontWeight:600}}>{md.pw||"—"}</div></div>
            <div style={{padding:12,borderRadius:10,background:`${C.purp}08`}}><div style={{fontSize:".68rem",color:C.txt2,marginBottom:4}}>靈魂挑戰</div><div style={{fontSize:".88rem",color:C.purp,fontWeight:600}}>{md.ch||"—"}</div></div>
          </div>
        </Glass>
        <Glass style={{marginBottom:14}}>
          <div style={{fontSize:".82rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>☆ 星際支援團隊</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{textAlign:"center",padding:10,borderRadius:8,background:"rgba(255,255,255,.02)"}}><div style={{fontSize:".65rem",color:C.txt2}}>引導</div><div style={{fontSize:".82rem",color:C.gold,marginTop:3}}>{m.guide}</div></div>
            <div style={{textAlign:"center",padding:10,borderRadius:8,background:"rgba(255,255,255,.02)"}}><div style={{fontSize:".65rem",color:C.txt2}}>挑戰</div><div style={{fontSize:".82rem",color:C.rose,marginTop:3}}>{m.anti}</div></div>
            <div style={{textAlign:"center",padding:10,borderRadius:8,background:"rgba(255,255,255,.02)"}}><div style={{fontSize:".65rem",color:C.txt2}}>隱藏力量</div><div style={{fontSize:".82rem",color:C.purp,marginTop:3}}>{m.occ}</div></div>
          </div>
        </Glass>
        <Glass><div style={{fontSize:".82rem",color:"#8bc8a0",letterSpacing:".12em",marginBottom:10}}>✦ 宇宙訊息</div><div style={{fontSize:".9rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{md.g||"跟隨你的直覺，宇宙正在引導你。"} 你的調性「{m.tone}」代表{m.td}的力量——這是你獨特的能量振動方式。當你與這個頻率對齊時，生命會以驚喜的方式展開。</div></Glass>
      </div><style>{CSS}</style>
    </div>);
  }
  // ── BAZI PAGE ──
  if(page==="bazi"&&soul){
    const b=soul.bazi,cy=new Date().getFullYear(),curAge=cy-(soul.ziwei?.bY||1996);
    const ELC={"火":"#e06848","水":"#4a90c8","木":"#5ca868","土":"#c8a43c","金":"#b8b8b8"};
    const ai=aiReading?.bazi;
    const SR=({r})=><div style={{display:"flex",gap:2}}>{Array.from({length:5},(_,i)=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i<Math.floor(r)?C.gold:i<r?`linear-gradient(90deg,${C.gold} 50%,rgba(212,165,116,.1) 50%)`:"rgba(212,165,116,.1)"}}/>)}</div>;
    /* flow year data */
    const lyYsi=b.lysi,lySH=SHT[lyYsi],lySS=b.lySS;
    const lyRating=lySS==="正印"||lySS==="偏印"?4:lySS==="正官"||lySS==="食神"?3.5:lySS==="傷官"||lySS==="七殺"?3:lySS==="正財"?3.5:lySS==="偏財"?3:2.5;
    /* flow year sections */
    const fySections=[
      {title:"整體格局",icon:"◎",rating:lyRating,fallback:`${cy}年${ST[lyYsi]}${BR[((cy-4)%12+12)%12]}年，流年十神為「${lySS}」。${lySS==="偏印"?"偏印年最利技術精進和獨立創新，是深度學習的好時機。":lySS==="正印"?"正印年帶來貴人和學習機會，適合沉澱充電。":lySS==="傷官"?"傷官年創意爆發，適合大膽表達和打造代表作。":lySS==="食神"?"食神年生活愉快，適合享受當下並發展興趣。":lySS==="正財"?"正財年收入穩定，適合踏實經營。":lySS==="偏財"?"偏財年機會多但風險也大，見好就收。":lySS==="七殺"?"七殺年壓力大但成長快，逼出你的潛力。":lySS==="正官"?"正官年適合承擔責任和建立公信力。":"穩步前進的一年。"}`},
      {title:"事業運",icon:"⚡",rating:Math.min(5,lyRating+.5),fallback:`${lySH[0]}化祿帶來事業上的助力——${luD[lySH[0]]||"好運加持"}。${lySH[1]}化權增強你的主導力和決策力。今年適合精進專業、累積代表作。`},
      {title:"財運",icon:"◈",rating:lyRating,fallback:`正財穩中有升，特別是靠專業技能賺的錢。${lySH[3]}化忌提醒在${jiD[lySH[3]]||"相關領域"}方面要留心。建議把主力放在穩定收入，投機操作控制風險。`},
      {title:"感情人際",icon:"♢",rating:Math.max(2,lyRating-.5),fallback:`${lySS==="偏印"?"偏印年社交慾望偏低，享受獨處是正常的，但重要關係需要刻意維護。":lySS==="傷官"?"傷官年說話容易太直，注意溝通方式。":"保持真誠和耐心，好的關係會自然深化。"}`},
      {title:"健康",icon:"○",rating:3,fallback:`注意${b.dmEl==="土"?"脾胃消化":b.dmEl==="火"?"心血管和睡眠":b.dmEl==="木"?"肝膽和情緒":b.dmEl==="金"?"呼吸系統和皮膚":"腎臟和泌尿系統"}。規律作息和適度運動是今年的基本功。`}
    ];
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{position:"relative",zIndex:1,maxWidth:560,margin:"0 auto",padding:"16px 14px 40px"}}>
        <PB icon="☰" title="八字命理"/>
        {/* Tab bar */}
        <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid rgba(212,165,116,.12)",position:"sticky",top:48,background:C.bg,zIndex:10,paddingTop:4}}>
          {["八字命盤",`${cy}流年`,"大運走勢"].map((t,i)=><button key={i} onClick={()=>setBzTab(i)} style={{flex:1,padding:"10px 0",border:"none",background:"none",color:bzTab===i?C.gold:"rgba(212,165,116,.4)",fontSize:".82rem",fontWeight:bzTab===i?700:400,fontFamily:"inherit",cursor:"pointer",borderBottom:bzTab===i?`2px solid ${C.gold}`:"2px solid transparent",transition:"all .2s",letterSpacing:".08em"}}>{t}</button>)}
        </div>

        {/* ═══ TAB 0: 八字命盤 ═══ */}
        {bzTab===0&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{textAlign:"center",padding:"16px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.35)",letterSpacing:".2em",marginBottom:6}}>四柱八字</div>
            <div style={{fontSize:"1.3rem",fontWeight:700,color:C.gold,letterSpacing:".3em"}}>{b.pillars.map(p=>p.stem+p.branch).join(" ")}</div>
            <div style={{fontSize:".75rem",color:"rgba(212,165,116,.45)",marginTop:6}}>日主：{b.pillars[2].stem}（{b.dmEl}）｜ {b.sDesc}</div>
          </div>
          {/* Four Pillars */}
          <div style={{display:"flex",gap:6}}>
            {b.pillars.map((p,i)=><div key={i} onClick={()=>setPillarOpen(pillarOpen===i?null:i)} style={{flex:1,minWidth:70,border:p.isDay?"1px solid rgba(212,165,116,.3)":"1px solid rgba(212,165,116,.08)",borderRadius:8,background:p.isDay?"rgba(212,165,116,.05)":"rgba(212,165,116,.02)",padding:"10px 4px",cursor:"pointer",transition:"all .2s"}}>
              <div style={{textAlign:"center",fontSize:".6rem",color:"rgba(212,165,116,.4)",marginBottom:4,letterSpacing:".1em"}}>{p.label}</div>
              <div style={{textAlign:"center",marginBottom:2}}><span style={{fontSize:"1.6rem",fontWeight:700,color:ELC[p.stemEl]||C.gold,fontFamily:"inherit"}}>{p.stem}</span></div>
              <div style={{textAlign:"center",fontSize:".58rem",color:"rgba(212,165,116,.35)",marginBottom:6}}>{p.stemEl} {p.stemGod}</div>
              <div style={{textAlign:"center",marginBottom:2}}><span style={{fontSize:"1.3rem",fontWeight:600,color:ELC[p.branchEl]||C.gold,opacity:.8}}>{p.branch}</span></div>
              <div style={{textAlign:"center",fontSize:".58rem",color:"rgba(212,165,116,.35)",marginBottom:4}}>{p.branchEl} {p.branchGod}</div>
              {pillarOpen===i&&p.branchHidden.length>0&&<div style={{marginTop:6,paddingTop:6,borderTop:"1px solid rgba(212,165,116,.06)"}}>
                <div style={{fontSize:".5rem",color:"rgba(212,165,116,.3)",textAlign:"center",marginBottom:3,letterSpacing:".1em"}}>藏干</div>
                {p.branchHidden.map((h,j)=><div key={j} style={{display:"flex",justifyContent:"center",gap:4,alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:".72rem",color:ELC[h.el]||C.gold,fontWeight:600}}>{h.stem}</span>
                  <span style={{fontSize:".5rem",color:"rgba(212,165,116,.3)"}}>{h.god}</span>
                </div>)}
              </div>}
            </div>)}
          </div>
          {/* Day master analysis */}
          <div style={{padding:14,borderRadius:8,background:"rgba(212,165,116,.03)",border:"1px solid rgba(212,165,116,.06)"}}>
            <div style={{fontSize:".9rem",fontWeight:700,color:ELC[b.dmEl]||C.gold,marginBottom:8,letterSpacing:".05em"}}>日主：{b.pillars[2].stem}{b.dmEl}（{b.dmEl==="木"?"陽木":""}{"乙卯".includes(b.pillars[2].stem)?"陰":"陽"}{b.dmEl}）</div>
            <div style={{fontSize:".85rem",color:"rgba(255,255,255,.6)",lineHeight:1.9}}>{ai?.personality||`${b.dmEl==="木"?"你像一棵參天大樹，沉穩而充滿生機。仁慈和成長是你的底色。":b.dmEl==="火"?"你像一盞溫暖的燭火，熱情而明亮。你天生具備照亮他人的能力。":b.dmEl==="土"?"你像大地一樣穩重包容，讓身邊的人感到安全。踏實和信任是你最大的資產。":b.dmEl==="金"?"你像一把精煉的寶劍，果斷而有原則。你的銳利讓你在關鍵時刻成為最可靠的決策者。":"你像一條深邃的河流，智慧而靈動。你的直覺力和適應力是別人羨慕的天賦。"}`}</div>
          </div>
          {/* Five element bars */}
          <div style={{padding:14,borderRadius:8,border:"1px solid rgba(212,165,116,.06)"}}>
            <div style={{fontSize:".72rem",color:"rgba(212,165,116,.35)",letterSpacing:".15em",marginBottom:10}}>五行分析</div>
            {["木","火","土","金","水"].map(el=><div key={el} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:ELC[el],fontSize:".85rem",fontWeight:700}}>{el}</span>
                  <span style={{fontSize:".65rem",color:"rgba(212,165,116,.4)"}}>{el===b.dmEl?"比劫":el===b.strong?"最強":""}{ el===b.weak?" (需補)":""}</span>
                </div>
                <span style={{fontSize:".65rem",color:"rgba(212,165,116,.3)"}}>{b.wx5[el]}%</span>
              </div>
              <div style={{height:4,borderRadius:2,background:"rgba(212,165,116,.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${b.wx5[el]}%`,background:ELC[el],borderRadius:2,opacity:.7}}/></div>
            </div>)}
          </div>
          {/* Pattern */}
          <div style={{padding:14,borderRadius:8,background:"rgba(224,104,72,.03)",border:"1px solid rgba(224,104,72,.1)"}}>
            <div style={{fontSize:".9rem",fontWeight:700,color:"#e06848",marginBottom:8,letterSpacing:".05em"}}>命局格局：{b.mainPattern}</div>
            <div style={{fontSize:".85rem",color:"rgba(255,255,255,.6)",lineHeight:1.9}}>{b.mainPattern==="傷官生財"?"傷官生財是「靠才華和技術賺錢」的經典格局。你天生就有把創意變成收入的能力，關鍵是日主要夠強才撐得住。":b.mainPattern==="食神生財"?"食神生財格局溫和而有福氣，代表你能在享受生活的同時自然地累積財富。":"你的命局格局穩健，適合按部就班地發展，每一步都會累積成未來的資本。"}</div>
          </div>
          <div style={{fontSize:".6rem",color:"rgba(212,165,116,.25)",textAlign:"center",fontStyle:"italic"}}>點擊四柱可展開查看藏干</div>
        </div>}

        {/* ═══ TAB 1: 流年 ═══ */}
        {bzTab===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{textAlign:"center",padding:"16px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.35)",letterSpacing:".2em",marginBottom:4}}>流年八字</div>
            <div style={{display:"flex",justifyContent:"center",gap:16,alignItems:"baseline"}}>
              <span style={{fontSize:"2rem",fontWeight:700,color:ELC[WX[lyYsi]]||C.gold}}>{ST[lyYsi]}</span>
              <span style={{fontSize:"1.6rem",fontWeight:600,color:ELC[WX[lyYsi]]||C.gold,opacity:.8}}>{BR[((cy-4)%12+12)%12]}</span>
            </div>
            <div style={{fontSize:".75rem",color:"rgba(212,165,116,.45)",marginTop:4}}>{lySS}年 ・ {WX[lyYsi]}氣{b.dmEl==="土"&&WX[lyYsi]==="火"?"生土":""}</div>
            <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
              {[{s:lySH[0],h:"化祿",c:C.gold},{s:lySH[1],h:"化權",c:C.rose},{s:lySH[2],h:"化科",c:C.blue},{s:lySH[3],h:"化忌",c:"rgba(180,130,130,.7)"}].map((h,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:".85rem",fontWeight:700,color:h.c}}>{h.s}</div><div style={{fontSize:".55rem",color:"rgba(212,165,116,.3)"}}>{h.h}</div></div>)}
            </div>
          </div>
          {fySections.map((s,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(212,165,116,.02)",border:"1px solid rgba(212,165,116,.06)",borderRadius:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:C.gold,fontSize:".88rem"}}>{s.icon}</span>
                <span style={{color:"rgba(255,255,255,.85)",fontSize:".88rem",fontWeight:600,letterSpacing:".05em"}}>{s.title}</span>
              </div>
              <SR r={s.rating}/>
            </div>
            <div style={{fontSize:".82rem",lineHeight:1.9,color:"rgba(255,255,255,.55)"}}>{ai?.[s.title==="整體格局"?"overall":s.title==="事業運"?"career":s.title==="財運"?"wealth":s.title==="感情人際"?"love":"health"]||s.fallback}</div>
          </div>)}
        </div>}

        {/* ═══ TAB 2: 大運走勢 ═══ */}
        {bzTab===2&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{textAlign:"center",padding:"16px 0",borderBottom:"1px solid rgba(212,165,116,.08)"}}>
            <div style={{fontSize:".65rem",color:"rgba(212,165,116,.35)",letterSpacing:".2em",marginBottom:4}}>十年大運</div>
            <div style={{fontSize:"1.15rem",fontWeight:700,color:C.gold,letterSpacing:".15em"}}>大運走勢</div>
          </div>
          {/* Energy curve */}
          <div style={{padding:"12px 8px",background:"rgba(212,165,116,.02)",borderRadius:8,border:"1px solid rgba(212,165,116,.06)"}}>
            <div style={{fontSize:".62rem",color:"rgba(212,165,116,.3)",letterSpacing:".15em",marginBottom:8,textAlign:"center"}}>能量曲線</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:80,justifyContent:"center"}}>
              {b.daYun.map((d,i)=>{const h=(d.rating/5)*70+10;return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}>
                <div style={{fontSize:".5rem",color:d.peak?"#f0c040":d.current?C.gold:"rgba(212,165,116,.3)",fontWeight:d.peak?700:400}}>{d.rating.toFixed(1)}</div>
                <div style={{width:"100%",maxWidth:36,height:h,borderRadius:"3px 3px 0 0",background:d.peak?"linear-gradient(to top,rgba(240,192,64,.3),rgba(240,192,64,.7))":d.current?"linear-gradient(to top,rgba(224,104,72,.2),rgba(224,104,72,.5))":"linear-gradient(to top,rgba(212,165,116,.05),rgba(212,165,116,.15))",border:d.peak?"1px solid rgba(240,192,64,.35)":d.current?"1px solid rgba(224,104,72,.25)":"none"}}/>
                <div style={{fontSize:".65rem",fontWeight:700,color:d.peak?"#f0c040":d.current?"#e06848":"rgba(212,165,116,.4)"}}>{d.stem}{d.branch}</div>
                <div style={{fontSize:".5rem",color:"rgba(212,165,116,.25)"}}>{d.age}歲</div>
              </div>)})}
            </div>
          </div>
          {/* Detail cards */}
          {b.daYun.map((d,i)=><div key={i} style={{padding:"12px 14px",background:d.peak?"rgba(240,192,64,.03)":d.current?"rgba(224,104,72,.03)":"rgba(212,165,116,.02)",border:d.peak?"1px solid rgba(240,192,64,.2)":d.current?"1px solid rgba(224,104,72,.15)":"1px solid rgba(212,165,116,.06)",borderRadius:8,position:"relative"}}>
            {d.current&&<span style={{position:"absolute",top:8,right:10,fontSize:".55rem",color:"#e06848",background:"rgba(224,104,72,.12)",padding:"2px 8px",borderRadius:4,fontWeight:700}}>← 現在</span>}
            {d.peak&&<span style={{position:"absolute",top:8,right:10,fontSize:".55rem",color:"#0e0d07",background:"#f0c040",padding:"2px 8px",borderRadius:4,fontWeight:700}}>★ 黃金大運</span>}
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{minWidth:50}}>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:ELC[d.el]||C.gold}}>{d.stem}{d.branch}</div>
                <div style={{fontSize:".58rem",color:"rgba(212,165,116,.3)",marginTop:2}}>{d.years}</div>
                <div style={{fontSize:".58rem",color:"rgba(212,165,116,.3)"}}>{d.age}歲</div>
                <div style={{marginTop:4}}><SR r={d.rating}/></div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:".85rem",fontWeight:700,marginBottom:4,color:d.peak?"#f0c040":d.current?"#e06848":"rgba(255,255,255,.85)"}}>{d.el==="火"?"印星暖身期":d.el==="土"?"比劫助力期":d.el==="木"?"官殺磨練期":d.el==="金"?"食傷才華期":"財星機遇期"}</div>
                <div style={{fontSize:".78rem",color:"rgba(255,255,255,.45)",lineHeight:1.8}}>{ai?.daYun?.[i]||`${d.stem}${d.branch}大運，${d.el}氣主導。${d.current?"這是你目前正在走的大運。":d.peak?"這是你一生中能量最強的黃金十年！":"穩步前行，每一步都是積累。"}`}</div>
              </div>
            </div>
          </div>)}
          {/* Conclusion */}
          <div style={{margin:"6px 0",padding:16,background:"rgba(240,192,64,.04)",border:"1px solid rgba(240,192,64,.15)",borderRadius:8}}>
            <div style={{fontSize:".88rem",fontWeight:700,color:"#f0c040",marginBottom:8,letterSpacing:".05em"}}>結論</div>
            <div style={{fontSize:".85rem",color:"rgba(255,255,255,.55)",lineHeight:1.9}}>{ai?.peak||`你的黃金大運在 ${b.daYun.find(d=>d.peak)?.age||"未來"}歲啟動。現在的每一步努力都是在為那個高光時刻蓄力。把專業做到極致，時候到了，一切會自然匯流。`}</div>
          </div>
        </div>}
      </div>
      <style>{CSS}</style>
    </div>);
  }
  // ── FORTUNE PAGE ──
  if(page==="fortune"){
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:480,margin:"0 auto",padding:"30px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="☰" title="線上擲筊求籤"/>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:"1.4rem",fontWeight:700,color:C.gold,letterSpacing:".1em"}}>行天宮線上求籤</div>
          <div style={{fontSize:".74rem",color:C.txt2,marginTop:4}}>心誠則靈，擲出聖筊方可取籤</div>
        </div>
        <Glass><Jiaobei/></Glass>
      </div><style>{CSS}</style>
    </div>);
  }

  // Fallback
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
    <div style={{textAlign:"center",padding:60,position:"relative",zIndex:1}}>
      <div style={{fontSize:".9rem",color:C.txt2}}>請先輸入生辰資料</div>
      <button onClick={()=>setPage("input")} style={{marginTop:16,padding:"8px 24px",background:`${C.gold}22`,border:`1px solid ${C.gold}44`,borderRadius:20,color:C.gold,fontSize:".8rem",cursor:"pointer",fontFamily:"inherit"}}>返回輸入</button>
    </div><style>{CSS}</style>
  </div>);
}

const CSS=`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600;700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus,select:focus,textarea:focus,button:focus{outline:none}button:hover{filter:brightness(1.08)}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:rgba(255,255,255,.02)}::-webkit-scrollbar-thumb{background:rgba(212,165,116,.15);border-radius:2px}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes glow{0%,100%{filter:brightness(1) drop-shadow(0 0 8px rgba(212,165,116,.2))}50%{filter:brightness(1.2) drop-shadow(0 0 16px rgba(212,165,116,.4))}}@keyframes tubeshake{0%{transform:translateX(-50%) rotate(-2deg)}100%{transform:translateX(-50%) rotate(2deg)}}@keyframes stickshake{0%{transform:translateX(-50%) rotate(var(--base-angle,0deg)) translateY(0)}100%{transform:translateX(-50%) rotate(calc(var(--base-angle,0deg) + 3deg)) translateY(-6px)}}@keyframes stickrise{0%{transform:translateX(-50%) translateY(0)}30%{transform:translateX(-50%) translateY(-8px)}60%{transform:translateX(-50%) translateY(-80px)}100%{transform:translateX(-50%) translateY(-110px)}}@keyframes dotpulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:.8;transform:scale(1.2)}}@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}@keyframes cardShuffle{0%{transform:translateX(-30px) rotate(-8deg)}100%{transform:translateX(30px) rotate(8deg)}}@keyframes cardLift{0%{transform:translateY(0);box-shadow:0 4px 20px rgba(0,0,0,.5)}100%{transform:translateY(-40px);box-shadow:0 16px 50px rgba(180,130,180,.25),0 0 80px rgba(180,130,180,.1)}}@keyframes cardFlip{0%{transform:rotateY(0)}100%{transform:rotateY(180deg)}}@keyframes coinSpin{0%{transform:translateY(0) rotateX(0)}100%{transform:translateY(-12px) rotateX(180deg)}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}select option{background:#1a1428}@keyframes nebulaSway{0%{transform:translate(0%,0%) scale(1.05) rotate(0deg)}50%{transform:translate(2%,-1.5%) scale(1.08) rotate(.5deg)}100%{transform:translate(-1%,1%) scale(1.06) rotate(-.3deg)}}@keyframes nebulaFloat1{0%{transform:translate(-3vw,-2vh) scale(1)}100%{transform:translate(4vw,3vh) scale(1.06)}}@keyframes nebulaFloat2{0%{transform:rotate(-25deg) scale(2,.6)}100%{transform:rotate(-22deg) scale(2.1,.65) translate(2vw,-1vh)}}@keyframes nebulaFloat3{0%{transform:translate(2vw,2vh) scale(1.02)}100%{transform:translate(-3vw,-2vh) scale(1)}}`;
