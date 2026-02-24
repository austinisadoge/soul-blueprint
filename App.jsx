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
const LPD={1:{t:"領導者",d:"你是天生的開拓者，擁有獨立自主的靈魂。你來到這世界就是為了走沒人走過的路。",g:["領導力","創新力","獨立"],love:"你需要尊重你獨立性的伴侶。學會偶爾示弱——這不是軟弱而是信任。",career:"創業、自由職業或任何能讓你做主的角色。你天生就是要開創自己的事業。",ch:"在堅持自我的同時接納他人。獨行俠走得快，團隊走得遠。"},2:{t:"和平使者",d:"你是天生的調和者，能感知到別人注意不到的細微情緒和能量。",g:["共情力","合作","直覺"],love:"你天生懂得維繫關係，但小心不要為了和諧而委屈自己。",career:"諮商、調解、藝術創作。你是天生的幕後推手。",ch:"學會為自己發聲。你太容易把別人放在自己前面。"},3:{t:"表達者",d:"你是天生的藝術家，你的笑容和話語有治癒人心的魔力。",g:["創造力","溝通","幽默"],love:"你需要欣賞你創造力的伴侶。風趣迷人的你需要學會更深入的情感表達。",career:"寫作、表演、設計、演講。任何能讓你表達的平台都是你的舞台。",ch:"找到真正屬於你的聲音，而非迎合他人的期待。"},4:{t:"建造者",d:"你是天生的實踐家，你把混亂變成秩序，把夢想變成現實。",g:["執行力","組織","忠誠"],love:"你在感情中可靠得像一座山。但偶爾的浪漫也很重要。",career:"工程、建築、項目管理。你是讓事情「落地」的人。",ch:"在穩定中保持彈性。不是所有事情都需要計畫。"},5:{t:"自由靈魂",d:"你是天生的冒險家，對世界充滿好奇。你的人生就是一場精彩探險。",g:["適應力","勇氣","多元"],love:"你需要空間和自由。但學會在自由中建立承諾才是真正的成長。",career:"旅遊、銷售、媒體。你適合變化多端的工作環境。",ch:"在追求自由中找到內在的定錨點。不是每次無聊就要換跑道。"},6:{t:"療癒者",d:"你是天生的照顧者，你的存在讓周圍的人感到安全。",g:["愛","責任感","美感"],love:"你是完美的伴侶，但小心「救世主情結」。愛自己是第一課。",career:"教育、醫療、室內設計。任何能照顧他人的工作。",ch:"愛人先愛己。責任不等於犧牲。"},7:{t:"探索者",d:"你是天生的哲學家，你總在追尋生命更深的意義。",g:["分析力","靈性","智慧"],love:"你需要能深度對話的伴侶。但也別因太挑而錯過好人。",career:"研究、哲學、心理學、靈性療癒。需要深度思考的工作。",ch:"平衡精神追求與現實生活。身體也需要被照顧。"},8:{t:"成就者",d:"你是天生的權力掌握者。你來這裡就是為了做大事。",g:["商業頭腦","決斷","影響力"],love:"你追求「最好的」，但真正的富足來自內心的豐盛。",career:"商業、金融、管理、政治。你有登頂的野心和實力。",ch:"真正的富足不只是金錢。用影響力去造福他人。"},9:{t:"智者",d:"你是天生的人道主義者，你看到的是全人類而非只是自己。",g:["同理心","大愛","智慧"],love:"你的愛是博大的，但也要學會給出專屬的愛。",career:"慈善事業、藝術、國際組織。讓世界更好是你的使命。",ch:"學會放手和完結。結束才能帶來新的開始。"},11:{t:"靈性導師",d:"大師數靈魂，你能看到別人看不到的真相。",g:["靈感","啟發","通靈"],love:"你需要理解你靈性面的伴侶。你的敏感度很高。",career:"靈性教師、藝術家、發明家。你的直覺是最強工具。",ch:"將靈性洞見落地。光有遠見不夠，要帶到地面上。"},22:{t:"夢想建築師",d:"大師數靈魂，擁有將宏大願景化為現實的驚人能力。",g:["遠見","實踐","轉化"],love:"你對一切標準都很高。學會接受不完美的美好。",career:"大型企業、社會改革。你是來建造改變世界的東西的。",ch:"克服內在恐懼。你的潛力巨大，但也背負巨大壓力。"},33:{t:"宇宙治療師",d:"最稀有的大師數，你的存在本身就有療癒力。",g:["大愛","奉獻","慈悲"],love:"你的愛超越個人層面，但也需要在親密關係中表達具體的愛。",career:"靈性領袖、治療師、人道主義工作。",ch:"超越個人苦難，成為集體的療癒力量。"}};
function getHD(y,m,d,h){const s=hs(y,m,d,h);const auth=["薦骨回應","情緒波","脾直覺","自我投射","意志力","環境/月亮"][Math.floor(hs(y,d,m,h+1)*6)];const def=["1/3 探究烈士","2/4 隱士機會者","3/5 實驗異端","4/6 機會典範","5/1 異端探究","6/2 典範隱士"][Math.floor(hs(d,m,y,h)*6)];const base={auth,def};if(s<.32)return{...base,type:"生產者",st:"等待回應",desc:"你的能量如太陽般持續發光。當外界給你訊號時，身體會用薦骨的「嗯哼」回應。做好自己，散發你的頻率，對的人事物會主動靠近。",pct:"37%",sig:"滿足感",notSelf:"挫敗感",tips:"每天問自己：做的事讓我滿足嗎？追隨滿足感，它會帶你走向正確的路。",energy:"你擁有持續穩定的薦骨能量，是世界的建造者。但如果做不喜歡的事，能量會迅速枯竭。"};if(s<.55)return{...base,type:"顯示生產者",st:"等待回應再告知",desc:"你是多工天才，人生不是直線而是華麗的之字形冒險。你會跳過不必要的步驟，用最快速度到達終點。記得行動前通知身邊重要的人。",pct:"33%",sig:"滿足感＋平靜",notSelf:"挫敗＋憤怒",tips:"你的效率驚人，但「跳步驟」會讓別人跟不上。慢下來不是浪費時間。",energy:"你同時擁有薦骨持續能量和喉嚨顯化力。但不是每件事都需要你插手。"};if(s<.76)return{...base,type:"投射者",st:"等待邀請",desc:"你是天生的引導者，能看穿他人的天賦。你的能量不在做多少事，而在用智慧引導對的人。等待邀請不是被動——是深刻的自我信任。",pct:"21%",sig:"成功",notSelf:"苦澀感",tips:"最大的陷阱是沒被邀請就給建議。等待邀請時，你的智慧會被珍惜。注意能量有限，學會休息充電。",energy:"你沒有持續的薦骨能量，不適合高強度工作。你的超能力是「看見」別人看不見的東西。"};if(s<.92)return{...base,type:"顯示者",st:"告知",desc:"你是開路先鋒，擁有點燃火花、開啟新時代的能力。你不需要等待任何人的許可，唯一秘訣是行動前告知你在乎的人。",pct:"8%",sig:"平靜",notSelf:"憤怒",tips:"你的氣場是封閉的，別人可能覺得你難以接近。主動告知能減少阻力和誤解。",energy:"你擁有強大的爆發力和啟動能量。你來這世界就是為了打頭陣。"};return{...base,type:"反映者",st:"等待月亮週期",desc:"你是極其稀有的存在（僅佔1%），像一面清澈的鏡子。你會取樣周圍的能量，感受所有人的感受。給自己28天來做重大決策。",pct:"1%",sig:"驚喜",notSelf:"失望",tips:"你是社群健康的指標。選擇正確的環境對你至關重要。",energy:"你的能量完全取決於環境。在好環境中放大美好，在糟環境中承受負面。保護能量場是首要任務。"}}
const MSL=["紅龍","白風","藍夜","黃種子","紅蛇","白世界橋","藍手","黃星星","紅月","白狗","藍猴","黃人","紅天行者","白巫師","藍鷹","黃戰士","紅地球","白鏡","藍風暴","黃太陽"];
const MTN=["磁性","月亮","電力","自我存在","超頻","韻律","共振","銀河","太陽","行星","光譜","水晶","宇宙"];
const MDS={"紅龍":{c:"滋養與誕生",d:"孕育新開始的力量",g:"信任生命會照顧你",pw:"原始信任",ch:"過度照顧而忽略自己"},"白風":{c:"溝通與靈感",d:"宇宙訊息的傳遞者",g:"真實的表達是你的力量",pw:"呼吸與靈感",ch:"散漫缺乏方向"},"藍夜":{c:"豐盛與夢境",d:"透過夢接收宇宙訊息",g:"相信你的夢想",pw:"豐盛顯化",ch:"過度沉浸幻想"},"黃種子":{c:"開花與目標",d:"每個決定都會綻放",g:"最美的花需要最長時間",pw:"耐心與信念",ch:"過度期待結果"},"紅蛇":{c:"生命力與本能",d:"強大的生存智慧",g:"信任你的身體直覺",pw:"生命力",ch:"恐懼與執著"},"白世界橋":{c:"連接與放下",d:"不同世界的橋樑",g:"放下才能得到",pw:"連結超越",ch:"害怕改變"},"藍手":{c:"療癒與知曉",d:"雙手擁有療癒能量",g:"用雙手去創造療癒",pw:"療癒之手",ch:"過度控制"},"黃星星":{c:"美與藝術",d:"感知宇宙的和諧",g:"把美帶入日常生活",pw:"藝術創造",ch:"追求完美"},"紅月":{c:"淨化與流動",d:"水般的療癒力",g:"讓情緒像水一樣流動",pw:"淨化療癒",ch:"情緒氾濫"},"白狗":{c:"愛與忠誠",d:"心輪特別強大",g:"先學會無條件愛自己",pw:"忠誠之愛",ch:"過度付出"},"藍猴":{c:"遊戲與幻象",d:"看穿表象的智慧",g:"別把人生看太嚴肅",pw:"幽默魔法",ch:"逃避責任"},"黃人":{c:"自由意志",d:"獨立思考的勇氣",g:"勇敢做自己的選擇",pw:"自由意志",ch:"過度自我"},"紅天行者":{c:"探索與空間",d:"靈魂渴望穿越時空",g:"保持好奇心",pw:"空間旅行",ch:"無法安定"},"白巫師":{c:"永恆與魔法",d:"穿透時間幻象",g:"活在當下就是永恆",pw:"超越時間",ch:"操控"},"藍鷹":{c:"視野與創造",d:"從高處俯瞰全局",g:"先看清全貌再行動",pw:"遠見",ch:"脫離現實"},"黃戰士":{c:"智勇與提問",d:"戰士般的求知慾",g:"勇敢質疑",pw:"無畏探索",ch:"過度好鬥"},"紅地球":{c:"同步與導航",d:"與地球深刻連結",g:"跟隨生命的徵兆",pw:"共時性",ch:"執著控制"},"白鏡":{c:"真相與無盡",d:"映照事物本質",g:"接受真相",pw:"清晰洞察",ch:"過度批判"},"藍風暴":{c:"轉化與自我生成",d:"改變的催化劑",g:"擁抱變化",pw:"徹底轉化",ch:"破壞性"},"黃太陽":{c:"生命與開悟",d:"太陽般的光明",g:"讓光自然照耀",pw:"開悟之光",ch:"自我中心"}};
const MTD={"磁性":"統一吸引","月亮":"挑戰平衡","電力":"服務點亮","自我存在":"定義形式","超頻":"賦予力量","韻律":"組織平衡","共振":"連結通道","銀河":"整合完整","太陽":"意圖實現","行星":"完美顯化","光譜":"自由釋放","水晶":"合作凝聚","宇宙":"超越完成"};
function getMayan(y,m,d){const diff=Math.floor((new Date(y,m-1,d)-new Date(2006,0,14))/864e5);const k=((diff%260)+260)%260;const seal=MSL[k%20],tone=MTN[k%13];return{seal,tone,kin:k+1,d:MDS[seal],td:MTD[tone],guide:MSL[(k%20+12)%20],anti:MSL[(k%20+10)%20],occ:MSL[(k%20+18)%20]}}
function getBazi(y,m,d,h){const ysi=(y-4)%10,ybi=(y-4)%12,base=Math.floor((Date.UTC(y,m-1,d)-Date.UTC(1900,0,7))/864e5),dsi=((base%10)+10)%10;const WX=["木","木","火","火","土","土","金","金","水","水"],dm=WX[dsi],yEl=WX[ysi];const dd={"木":"你是一棵大樹，正直向上，仁慈包容。","火":"你是一團火焰，熱情開朗，照亮他人。","土":"你是一片大地，穩重踏實，承載萬物。","金":"你是一塊精鋼，意志堅定，果斷正義。","水":"你是一條河流，智慧靈動，適應萬變。"};const rel={"木":{"火":"木生火——你的仁慈點燃他人的熱情","土":"木剋土——你的成長需要打破現狀","金":"金剋木——外在壓力磨練你的韌性","水":"水生木——直覺和智慧滋養你的根源","木":"比肩——你身邊有同類型的夥伴"},"火":{"土":"火生土——你的熱情創造穩固基礎","金":"火剋金——你的光芒能融化一切阻礙","水":"水剋火——情緒管理是一生課題","木":"木生火——身邊善意持續點燃你","火":"比肩——你的能量場吸引同頻的人"},"土":{"金":"土生金——你的穩定孕育珍貴成果","水":"土剋水——你的務實穩住情緒波動","木":"木剋土——在壓力中學會成長","火":"火生土——熱情是你的養分","土":"比肩——穩定人際是你的力量"},"金":{"水":"金生水——你的果斷帶來智慧流動","木":"金剋木——你的銳利需要學會柔軟","火":"火剋金——過度壓力讓你脆弱","土":"土生金——穩固基礎是成功關鍵","金":"比肩——志同道合的夥伴很重要"},"水":{"木":"水生木——你的智慧滋養身邊人成長","火":"水剋火——你的冷靜平息衝突","土":"土剋水——過多框架限制你的流動","金":"金生水——邏輯幫助你更有方向","水":"比肩——你需要同樣深度的人"}};const s=hs(y,m,d,dsi);const sDesc=s>.6?"身強——內在能量充足，適合主動出擊。":s>.4?"中和——能量平衡，進退皆宜。":"身弱——需要外在支持，善用貴人的力量。";return{yg:ST[ysi]+BR[ybi],dm,dmEl:WX[dsi],desc:dd[dm],dsi,ysi,yEl,rel:rel[dm]?.[yEl]||"能量互動",sDesc}}

// ═══════════════════════════════════════
// ZIWEI ENGINE + K-LINE
// ═══════════════════════════════════════
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
  const lu=isLunar?{year:bY,month:bM,day:bD}:s2l(bY,bM,bD),sc=getSC(bH),ysi=(bY-4)%10,ybi=(bY-4)%12;
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
  return{P,lu,sc,ysi,ybi,lpp,bpp:(lpp+sc)%12,zwp,ju,yg:ST[ysi]+BR[ybi],bY}
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
  return <div style={{background:"rgba(25,22,50,0.55)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:16,border:`1px solid ${C.bdr}`,padding:24,boxShadow:"0 8px 32px rgba(0,0,0,.3)",position:"relative",overflow:"hidden",...style}} {...p}>
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
export default function App(){
  const[page,setPage]=useState("input"); // input, home, ziwei, bazi, zodiac, lifepath, humandesign, mayan, fortune
  const[bY,sBY]=useState(1996),[bM,sBM]=useState(3),[bD,sBD]=useState(15),[bH,sBH]=useState(8);
  const[gen,sGen]=useState("female"),[cal,sCal]=useState("solar");
  const[anim,sAnim]=useState(false);
  const[soul,setSoul]=useState(null); // all computed data
  const[dim,sDim]=useState("總運"),[tm,sTm]=useState("一生");
  const[cw,sCw]=useState(800);
  const cr=useRef(null);
  useEffect(()=>{const m=()=>{if(cr.current)sCw(Math.max(500,Math.min(1000,cr.current.offsetWidth-32)))};m();window.addEventListener("resize",m);return()=>window.removeEventListener("resize",m)},[]);

  const unlock=useCallback(()=>{
    sAnim(true);
    setTimeout(()=>{
      const isLunar=cal==="lunar";
      const zodiac=isLunar?"水瓶座":getZodiac(bM,bD); // lunar users get approximate
      const lp=getLP(bY,bM,bD);
      const hd=getHD(bY,bM,bD,bH);
      const mayan=getMayan(bY,bM,bD);
      const bazi=getBazi(bY,bM,bD,bH);
      const ziwei=genChart(bY,bM,bD,bH,isLunar);
      const syn=synthesize(zodiac,lp,hd,mayan,bazi,ziwei);
      setSoul({zodiac,lp,hd,mayan,bazi,ziwei,syn,lpd:LPD[lp]||LPD[1]});
      setPage("home");sAnim(false);
    },1200);
  },[bY,bM,bD,bH,gen,cal]);

  const ltd=useMemo(()=>soul?.ziwei&&tm==="一生"?genLife(soul.ziwei,dim):null,[soul,dim,tm]);
  const sd=useMemo(()=>soul?.ziwei&&tm!=="一生"?genSimp(soul.ziwei,dim,tm):null,[soul,dim,tm]);
  const peak=ltd?.pi>=0?ltd.data[ltd.pi]:null;
  const avg=useMemo(()=>{const d=ltd?.data||sd;if(!d?.length)return 0;return Math.round(d.reduce((a,c)=>a+c.close,0)/d.length)},[ltd,sd]);

  const PB=({icon,title})=><div onClick={()=>setPage("home")} style={{display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:14,padding:"6px 14px 6px 8px",borderRadius:20,background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,fontSize:".76rem",color:C.txt2,transition:"all .2s"}}><span style={{fontSize:".65rem",opacity:.5}}>←</span><span style={{fontSize:"1rem"}}>{icon}</span><span>{title}</span></div>;

  const navCards=[
    {id:"ziwei",icon:"📈",title:"紫微走勢",sub:"用K線看你的一生運勢起伏"},
    {id:"zodiac",icon:"✨",title:"星座解析",sub:`${soul?.zodiac||""}的深度剖析`},
    {id:"lifepath",icon:"🔮",title:"生命靈數",sub:`靈數${soul?.lp||""}號的靈魂密碼`},
    {id:"humandesign",icon:"⚡",title:"人類圖",sub:`你的能量類型與策略`},
    {id:"mayan",icon:"🌀",title:"瑪雅曆",sub:`你的星系印記`},
    {id:"bazi",icon:"🎋",title:"八字命理",sub:`日主五行解讀`},
    {id:"fortune",icon:"🏮",title:"線上擲筊求籤",sub:"行天宮籤詩指引"},
  ];

  // ── INPUT PAGE ──
  if(page==="input"){
    return(<div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 30% 20%,rgba(140,120,200,.08),transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(212,165,116,.05),transparent 50%),${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt,padding:20}}>
      <Stars/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:520}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:"clamp(2rem,6vw,3rem)",fontWeight:900,letterSpacing:".15em",background:`linear-gradient(135deg,${C.gold},${C.rose},${C.purp})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>靈魂藍圖</div>
          <div style={{fontSize:".78rem",color:C.txt2,letterSpacing:".3em",marginTop:4}}>SOUL BLUEPRINT</div>
          <div style={{margin:"16px auto",width:"60%",height:1,background:`linear-gradient(90deg,transparent,${C.gold}44,transparent)`}}/>
          <div style={{fontSize:".8rem",color:C.txt2,lineHeight:1.8}}>融合六大命理系統，解鎖專屬於你的靈魂印記</div>
        </div>
        <Glass>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
            {[["solar","陽曆"],["lunar","農曆"]].map(([v,l])=><button key={v} onClick={()=>sCal(v)} style={{padding:"6px 20px",borderRadius:20,fontSize:".8rem",fontFamily:"inherit",cursor:"pointer",background:cal===v?`linear-gradient(135deg,${C.gold},${C.rose})`:"transparent",color:cal===v?"#1a1428":C.txt2,border:cal===v?"none":`1px solid ${C.bdr}`,transition:"all .2s"}}>{l}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><label style={{display:"block",fontSize:".7rem",color:C.txt2,marginBottom:3}}>出生年</label><input type="number" min={1924} max={2010} value={bY} onChange={e=>sBY(+e.target.value)} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:8,fontSize:".88rem",color:C.txt,fontFamily:"inherit"}}/></div>
            <div><label style={{display:"block",fontSize:".7rem",color:C.txt2,marginBottom:3}}>出生月</label><select value={bM} onChange={e=>sBM(+e.target.value)} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:8,fontSize:".88rem",color:C.txt,fontFamily:"inherit"}}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1} style={{background:"#1a1428"}}>{i+1}月</option>)}</select></div>
            <div><label style={{display:"block",fontSize:".7rem",color:C.txt2,marginBottom:3}}>出生日</label><select value={bD} onChange={e=>sBD(+e.target.value)} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:8,fontSize:".88rem",color:C.txt,fontFamily:"inherit"}}>{Array.from({length:31},(_,i)=><option key={i+1} value={i+1} style={{background:"#1a1428"}}>{i+1}日</option>)}</select></div>
            <div style={{gridColumn:"1/-1"}}><label style={{display:"block",fontSize:".7rem",color:C.txt2,marginBottom:3}}>出生時辰</label><select value={bH} onChange={e=>sBH(+e.target.value)} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:8,fontSize:".88rem",color:C.txt,fontFamily:"inherit"}}>{SC_OPT.map(o=><option key={o.v} value={o.v} style={{background:"#1a1428"}}>{o.l}</option>)}</select></div>
            <div style={{gridColumn:"1/-1"}}><label style={{display:"block",fontSize:".7rem",color:C.txt2,marginBottom:3}}>性別</label><div style={{display:"flex",gap:6}}>{[["female","女"],["male","男"]].map(([v,l])=><button key={v} onClick={()=>sGen(v)} style={{flex:1,padding:"10px",borderRadius:8,fontSize:".85rem",fontFamily:"inherit",cursor:"pointer",background:gen===v?`linear-gradient(135deg,${C.gold}33,${C.rose}22)`:"rgba(255,255,255,.02)",color:gen===v?C.gold:C.txt2,border:`1px solid ${gen===v?C.gold+"44":C.bdr}`,transition:"all .2s"}}>{l}</button>)}</div></div>
          </div>
          <button onClick={unlock} disabled={anim} style={{display:"block",width:"100%",margin:"6px 0 0",padding:"14px",background:anim?"rgba(212,165,116,.15)":`linear-gradient(135deg,${C.gold},${C.rose})`,color:anim?C.txt2:"#1a1428",border:"none",borderRadius:12,fontSize:"1rem",fontWeight:700,cursor:anim?"wait":"pointer",fontFamily:"inherit",letterSpacing:".15em",boxShadow:anim?"none":"0 4px 24px rgba(212,165,116,.25)",transition:"all .3s"}}>{anim?"✧ 正在解讀星象 ✧":"✦ 解鎖靈魂印記 ✦"}</button>
        </Glass>
      </div>
      <style>{CSS}</style>
    </div>);
  }

  // ── NAV BAR ──
  const Nav=()=><div style={{position:"sticky",top:0,zIndex:50,background:"rgba(12,12,26,.85)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.bdr}`,padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <span onClick={()=>setPage("home")} style={{cursor:"pointer",fontSize:"1rem",fontWeight:700,background:`linear-gradient(135deg,${C.gold},${C.rose})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>靈魂藍圖</span>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {[["home","首頁"],["ziwei","紫微"],["fortune","求籤"]].map(([id,l])=><button key={id} onClick={()=>setPage(id)} style={{padding:"4px 12px",borderRadius:12,fontSize:".7rem",background:page===id?"rgba(212,165,116,.12)":"transparent",color:page===id?C.gold:C.txt2,border:"none",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
    </div>
  </div>;

  // ── HOME PAGE ──
  if(page==="home"&&soul){
    const s=soul.syn;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}>
      <Stars/><Nav/>
      <div style={{position:"relative",zIndex:1,maxWidth:720,margin:"0 auto",padding:"20px 16px 40px"}}>
        <div style={{textAlign:"center",margin:"10px 0 24px"}}>
          <div style={{fontSize:"1.6rem",fontWeight:700,letterSpacing:".1em",marginBottom:4}}>✦ 靈魂共鳴解析 ✦</div>
          <div style={{fontSize:".76rem",color:C.txt2}}>六大命理系統為你萃取的核心特質</div>
        </div>
        {/* Gift */}
        <Glass style={{marginBottom:14}}>
          <div style={{fontSize:".72rem",color:C.gold,letterSpacing:".15em",marginBottom:8}}>🌟 天賦能量</div>
          <div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>{s.giftText}</div>
        </Glass>
        {/* Cosmic guidance */}
        <Glass style={{marginBottom:14}}>
          <div style={{fontSize:".72rem",color:C.rose,letterSpacing:".15em",marginBottom:8}}>🌙 近期宇宙指引</div>
          <div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>{s.cosmic}</div>
        </Glass>
        {/* Shadow */}
        <Glass style={{marginBottom:20}}>
          <div style={{fontSize:".72rem",color:C.purp,letterSpacing:".15em",marginBottom:8}}>🔑 人生課題</div>
          <div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>{s.shadow}</div>
        </Glass>
        {/* Nav cards */}
        <div style={{fontSize:".82rem",fontWeight:600,textAlign:"center",marginBottom:12,color:C.txt2,letterSpacing:".1em"}}>── 深入探索各門派 ──</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {navCards.map(c=><Glass key={c.id} style={{cursor:"pointer",padding:"16px 18px",transition:"transform .2s"}} onClick={()=>setPage(c.id)}>
            <div style={{fontSize:"1.4rem",marginBottom:6}}>{c.icon}</div>
            <div style={{fontSize:".85rem",fontWeight:700,color:C.gold,marginBottom:3}}>{c.title}</div>
            <div style={{fontSize:".7rem",color:C.txt2,lineHeight:1.5}}>{c.sub}</div>
          </Glass>)}
        </div>
      </div>
      <style>{CSS}</style>
    </div>);
  }

  // ── ZIWEI K-LINE PAGE ──
  if(page==="ziwei"&&soul){
    const ch=soul.ziwei;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}>
      <Stars/><Nav/>
      <div ref={cr} style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"16px 14px 40px"}}>
        <PB icon="📈" title="紫微走勢"/>
        <div style={{textAlign:"center",marginBottom:14,fontSize:".76rem",color:C.txt2}}>
          農曆{ch.yg}年 ｜ {ch.ju.name} ｜ 命宮{BR[ch.lpp]} ｜ 生年四化：<span style={{color:C.gold}}>{SHT[ch.ysi][0]}祿</span> · <span style={{color:C.rose}}>{SHT[ch.ysi][1]}權</span> · <span style={{color:C.blue}}>{SHT[ch.ysi][2]}科</span> · <span style={{color:"#b07080"}}>{SHT[ch.ysi][3]}忌</span>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:8,flexWrap:"wrap"}}>
          {["總運","財運","健康","感情"].map(d=><button key={d} onClick={()=>sDim(d)} style={{padding:"6px 18px",borderRadius:20,fontSize:".8rem",fontFamily:"inherit",cursor:"pointer",background:dim===d?`linear-gradient(135deg,${C.gold}44,${C.rose}33)`:"transparent",color:dim===d?C.gold:C.txt2,border:dim===d?`1px solid ${C.gold}44`:`1px solid ${C.bdr}`,transition:"all .2s"}}>{d}</button>)}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:14}}>
          {["一生","流年","流月"].map(t=><button key={t} onClick={()=>sTm(t)} style={{padding:"3px 14px",fontSize:".74rem",fontFamily:"inherit",cursor:"pointer",background:"transparent",color:tm===t?C.gold:C.txt2,border:"none",borderBottom:tm===t?`2px solid ${C.gold}`:"2px solid transparent"}}>{t}</button>)}
        </div>
        <Glass style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
            <span style={{fontSize:".88rem",fontWeight:700,color:C.gold}}>{dim} · {tm}走勢</span>
            <div style={{display:"flex",gap:12,fontSize:".72rem",color:C.txt2}}>
              <span><span style={{display:"inline-block",width:8,height:8,background:C.gold,borderRadius:4,marginRight:3,verticalAlign:"middle"}}/>漲</span>
              <span><span style={{display:"inline-block",width:8,height:8,background:"#7b6baa",borderRadius:4,marginRight:3,verticalAlign:"middle"}}/>跌</span>
            </div>
          </div>
          {peak&&tm==="一生"&&<div style={{padding:"8px 16px",background:`${C.gold}08`,fontSize:".78rem",color:C.gold,borderBottom:`1px solid ${C.bdr}`}}>✦ 單年最高：{peak.year}年（{peak.yl}）{peak.age}歲 — {peak.close}分 <span style={{color:C.txt2}}>（平均 {avg} 分）</span></div>}
          <div style={{overflowX:"auto"}}>{tm==="一生"&&ltd?<KChart data={ltd.data} w={Math.max(cw,ltd.data.length*13)} h={380} isLife/>:sd?.length?<KChart data={sd} w={cw} h={340}/>:null}</div>
        </Glass>
        {/* Commentary */}
        <Glass style={{marginTop:14}}>
          <div style={{fontSize:".9rem",fontWeight:700,color:C.gold,marginBottom:8}}>{dim}分析 <span style={{float:"right",fontSize:".82rem",fontWeight:400,color:C.txt2}}>平均 <b style={{color:avg>=50?C.gold:"#b07080"}}>{avg}</b> 分</span></div>
          <div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{soul.syn.giftText.split("。")[0]}。{avg>60?"整體運勢不錯，好事多於壞事。":avg>45?"運勢中規中矩，穩扎穩打。":"運勢偏弱但別灰心，低谷是反彈前奏。"}</div>
          <div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:".7rem",color:C.txt2}}>能量值</span>
            <div style={{flex:1,height:4,background:"rgba(255,255,255,.04)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${avg}%`,background:`linear-gradient(90deg,${C.purp},${C.gold})`,borderRadius:2,transition:"width .5s"}}/></div>
            <span style={{fontSize:".82rem",fontWeight:800,color:C.gold}}>{avg}</span>
          </div>
        </Glass>
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
        <PB icon="✨" title="星座解析"/>
        <Glass style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:"2.5rem",marginBottom:6}}>{{"火":"🔥","水":"💧","土":"🌍","風":"💨"}[z.el]||"✨"}</div>
          <div style={{fontSize:"1.4rem",fontWeight:700,color:C.gold,marginBottom:4}}>{soul.zodiac}</div>
          <div style={{fontSize:".78rem",color:C.txt2}}>元素：{z.el} ｜ 能量：{z.en}</div>
        </Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 核心特質</div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{z.tr.map((t,i)=><span key={i} style={{padding:"6px 16px",borderRadius:20,background:`${C.gold}11`,border:`1px solid ${C.gold}33`,fontSize:".78rem",color:C.gold}}>{t}</span>)}</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>你是擁有「{z.en}」能量的{z.el}象星座。{z.tr.join("、")}——這些天賦讓你獨特而閃耀。</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>💕 感情解析</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt,marginBottom:10}}>{z.love}</div>{z.compat&&<div style={{fontSize:".76rem",color:C.txt2}}>最佳靈魂伴侶：{z.compat.map((c,i)=><span key={i} style={{display:"inline-block",margin:"2px 4px",padding:"3px 10px",borderRadius:12,background:`${C.rose}11`,border:`1px solid ${C.rose}33`,fontSize:".72rem",color:C.rose}}>{c}</span>)}</div>}</Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.blue,letterSpacing:".12em",marginBottom:10}}>💼 事業天賦</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{z.career}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:"#8bc8a0",letterSpacing:".12em",marginBottom:10}}>🌿 健康提醒</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{z.health}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.purp,letterSpacing:".12em",marginBottom:10}}>🔑 靈魂課題</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{z.sh}——擁抱它，它會成為你最大的力量。</div></Glass>
        <Glass style={{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center"}}><div style={{fontSize:".74rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>⚡ 能量雷達圖</div><Radar labels={["事業","財運","感情","健康","人緣","靈性"]} values={vals} size={240}/></Glass>
      </div><style>{CSS}</style>
    </div>);
  }

  // ── LIFE PATH PAGE ──
  if(page==="lifepath"&&soul){
    const lp=soul.lpd;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="🔮" title="生命靈數"/>
        <Glass style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:"3.5rem",fontWeight:900,background:`linear-gradient(135deg,${C.gold},${C.rose})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4,lineHeight:1.2}}>{soul.lp}</div><div style={{fontSize:"1.15rem",fontWeight:700,color:C.gold,marginBottom:6}}>{lp.t}</div><div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>{lp.g.map((g,i)=><span key={i} style={{padding:"5px 14px",borderRadius:20,background:`${C.purp}15`,border:`1px solid ${C.purp}33`,fontSize:".76rem",color:C.purp}}>{g}</span>)}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 靈魂藍圖</div><div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>{lp.d}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>💕 感情與關係</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{lp.love}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.blue,letterSpacing:".12em",marginBottom:10}}>💼 事業與財富</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{lp.career}</div></Glass>
        <Glass><div style={{fontSize:".74rem",color:C.purp,letterSpacing:".12em",marginBottom:10}}>🔑 人生核心課題</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{lp.ch}</div></Glass>
      </div><style>{CSS}</style>
    </div>);
  }

  // ── HUMAN DESIGN PAGE ──
  if(page==="humandesign"&&soul){
    const h=soul.hd;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="⚡" title="人類圖"/>
        <Glass style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:"2.2rem",marginBottom:8}}>⚡</div>
          <div style={{fontSize:"1.3rem",fontWeight:700,color:C.gold,marginBottom:4}}>{h.type}</div>
          <div style={{fontSize:".76rem",color:C.txt2,marginBottom:10}}>佔全球人口 {h.pct} ｜ 人生角色 {h.def}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{padding:8,borderRadius:8,background:`${C.gold}08`}}><div style={{fontSize:".65rem",color:C.txt2}}>策略</div><div style={{fontSize:".8rem",color:C.gold,fontWeight:600,marginTop:2}}>{h.st}</div></div>
            <div style={{padding:8,borderRadius:8,background:`${C.rose}08`}}><div style={{fontSize:".65rem",color:C.txt2}}>正向標記</div><div style={{fontSize:".8rem",color:C.rose,fontWeight:600,marginTop:2}}>{h.sig}</div></div>
            <div style={{padding:8,borderRadius:8,background:`${C.purp}08`}}><div style={{fontSize:".65rem",color:C.txt2}}>內在權威</div><div style={{fontSize:".8rem",color:C.purp,fontWeight:600,marginTop:2}}>{h.auth}</div></div>
          </div>
        </Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 你的設計</div><div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>{h.desc}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:"#8bc8a0",letterSpacing:".12em",marginBottom:10}}>⚡ 能量運作</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{h.energy}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>💡 生活實踐建議</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{h.tips}</div></Glass>
        <Glass><div style={{fontSize:".74rem",color:"#c08080",letterSpacing:".12em",marginBottom:10}}>⚠️ 非自己主題：{h.notSelf}</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>當你感到「{h.notSelf}」時，代表你偏離了自己的設計。回到策略「{h.st}」，信任「{h.auth}」內在權威，讓「{h.sig}」成為你的指南針。</div></Glass>
      </div><style>{CSS}</style>
    </div>);
  }

  // ── MAYAN PAGE ──
  if(page==="mayan"&&soul){
    const m=soul.mayan;const md=m.d||{};
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="🌀" title="瑪雅曆"/>
        <Glass style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:"2.2rem",marginBottom:8}}>🌀</div><div style={{fontSize:"1.2rem",fontWeight:700,color:C.gold}}>{m.tone} · {m.seal}</div><div style={{fontSize:".76rem",color:C.txt2,marginTop:4}}>Kin {m.kin} ｜ 調性：{m.td}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 星系印記：{md.c||""}</div><div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>你的本質是「{md.d||""}」。{md.g||""}</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div style={{padding:12,borderRadius:10,background:`${C.gold}08`}}><div style={{fontSize:".68rem",color:C.txt2,marginBottom:4}}>超能力</div><div style={{fontSize:".88rem",color:C.gold,fontWeight:600}}>{md.pw||"—"}</div></div><div style={{padding:12,borderRadius:10,background:`${C.purp}08`}}><div style={{fontSize:".68rem",color:C.txt2,marginBottom:4}}>靈魂挑戰</div><div style={{fontSize:".88rem",color:C.purp,fontWeight:600}}>{md.ch||"—"}</div></div></div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>🌟 星際支援團隊</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><div style={{textAlign:"center",padding:10,borderRadius:8,background:"rgba(255,255,255,.02)"}}><div style={{fontSize:".65rem",color:C.txt2}}>引導</div><div style={{fontSize:".82rem",color:C.gold,marginTop:3}}>{m.guide}</div></div><div style={{textAlign:"center",padding:10,borderRadius:8,background:"rgba(255,255,255,.02)"}}><div style={{fontSize:".65rem",color:C.txt2}}>挑戰</div><div style={{fontSize:".82rem",color:C.rose,marginTop:3}}>{m.anti}</div></div><div style={{textAlign:"center",padding:10,borderRadius:8,background:"rgba(255,255,255,.02)"}}><div style={{fontSize:".65rem",color:C.txt2}}>隱藏力量</div><div style={{fontSize:".82rem",color:C.purp,marginTop:3}}>{m.occ}</div></div></div></Glass>
        <Glass><div style={{fontSize:".74rem",color:"#8bc8a0",letterSpacing:".12em",marginBottom:10}}>🌿 宇宙訊息</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{md.g||"跟隨你的直覺。"} 調性「{m.tone}」代表{m.td}的力量——當你與這個頻率對齊時，生命會以驚喜的方式展開。</div></Glass>
      </div><style>{CSS}</style>
    </div>);
  }
  // ── BAZI PAGE ──
  if(page==="bazi"&&soul){
    const b=soul.bazi;
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:660,margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="🎋" title="八字命理"/>
        <Glass style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:"2rem",marginBottom:8}}>🎋</div><div style={{fontSize:"1.3rem",fontWeight:700,color:C.gold,marginBottom:6}}>日主：{b.dm}（{b.dmEl}）</div><div style={{fontSize:".78rem",color:C.txt2}}>年柱 {b.yg}（{b.yEl}）</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.gold,letterSpacing:".12em",marginBottom:10}}>✦ 日主解析</div><div style={{fontSize:".84rem",lineHeight:2,color:C.txt}}>{b.desc} 五行屬{b.dmEl}——{b.dmEl==="木"?"生長力和仁慈是你的底色":b.dmEl==="火"?"熱情和光明是你的底色":b.dmEl==="土"?"穩重和包容是你的底色":b.dmEl==="金"?"果斷和正義是你的底色":"智慧和靈動是你的底色"}。</div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.rose,letterSpacing:".12em",marginBottom:10}}>⚖️ 身強身弱</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{b.sDesc}</div><div style={{marginTop:8,height:6,borderRadius:3,background:"rgba(255,255,255,.04)",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(15,Math.min(85,(b.dsi+5)*10))}%`,background:`linear-gradient(90deg,${C.purp},${C.gold})`,borderRadius:3}}/></div></Glass>
        <Glass style={{marginBottom:14}}><div style={{fontSize:".74rem",color:C.blue,letterSpacing:".12em",marginBottom:10}}>🔄 五行生剋</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>日主「{b.dm}」與年柱「{b.yEl}」：{b.rel}</div><div style={{marginTop:10,display:"flex",justifyContent:"center",gap:10}}>{["木","火","土","金","水"].map(e=><div key={e} style={{width:44,height:44,borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".82rem",fontWeight:700,background:e===b.dmEl?`${C.gold}33`:e===b.yEl?`${C.rose}22`:"rgba(255,255,255,.03)",border:`1px solid ${e===b.dmEl?C.gold+"66":e===b.yEl?C.rose+"44":C.bdr}`,color:e===b.dmEl?C.gold:e===b.yEl?C.rose:C.txt2}}>{e}</div>)}</div></Glass>
        <Glass><div style={{fontSize:".74rem",color:"#8bc8a0",letterSpacing:".12em",marginBottom:10}}>🌿 開運建議</div><div style={{fontSize:".82rem",lineHeight:2,color:C.txt}}>{b.dmEl==="木"?"多親近自然，綠色是你的幸運色。春天是能量最旺的季節。":b.dmEl==="火"?"紅色紫色提升能量。保持熱情也要學會收斂。":b.dmEl==="土"?"黃色米色帶來穩定。季節交替時注意養生。":b.dmEl==="金"?"白色金色是幸運色。秋天適合做重要決定。":"黑色藍色增強能量。冬天是蓄力的最佳時機。"}</div></Glass>
      </div><style>{CSS}</style>
    </div>);
  }
  // ── FORTUNE PAGE ──
  if(page==="fortune"){
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:480,margin:"0 auto",padding:"30px 16px 40px",position:"relative",zIndex:1}}>
        <PB icon="🏮" title="線上擲筊求籤"/>
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

const CSS=`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600;700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus,select:focus,textarea:focus,button:focus{outline:none}button:hover{filter:brightness(1.08)}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:rgba(255,255,255,.02)}::-webkit-scrollbar-thumb{background:rgba(212,165,116,.15);border-radius:2px}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes glow{0%,100%{filter:brightness(1) drop-shadow(0 0 8px rgba(212,165,116,.2))}50%{filter:brightness(1.2) drop-shadow(0 0 16px rgba(212,165,116,.4))}}@keyframes tubeshake{0%{transform:translateX(-50%) rotate(-2deg)}100%{transform:translateX(-50%) rotate(2deg)}}@keyframes stickshake{0%{transform:translateX(-50%) rotate(var(--base-angle,0deg)) translateY(0)}100%{transform:translateX(-50%) rotate(calc(var(--base-angle,0deg) + 3deg)) translateY(-6px)}}@keyframes stickrise{0%{transform:translateX(-50%) translateY(0)}30%{transform:translateX(-50%) translateY(-8px)}60%{transform:translateX(-50%) translateY(-80px)}100%{transform:translateX(-50%) translateY(-110px)}}@keyframes dotpulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:.8;transform:scale(1.2)}}select option{background:#1a1428}`;
