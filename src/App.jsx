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
function getHD(y,m,d,h){const s=hs(y,m,d,h);const auth=["薦骨回應","情緒波","脾直覺","自我投射","意志力","環境/月亮"][Math.floor(hs(y,d,m,h+1)*6)];const def=["1/3 探究烈士","2/4 隱士機會者","3/5 實驗異端","4/6 機會典範","5/1 異端探究","6/2 典範隱士"][Math.floor(hs(d,m,y,h)*6)];const base={auth,def};if(s<.32)return{...base,type:"生產者",st:"等待回應",desc:"你的能量如太陽般持續發光。當外界給你訊號時，身體會用薦骨的「嗯哼」回應。做好自己，散發你的頻率，對的人事物會主動靠近。",pct:"37%",sig:"滿足感",notSelf:"挫敗感",tips:"每天問自己：做的事讓我滿足嗎？追隨滿足感，它會帶你走向正確的路。",energy:"你擁有持續穩定的薦骨能量，是世界的建造者。但如果做不喜歡的事，能量會迅速枯竭。"};if(s<.55)return{...base,type:"顯示生產者",st:"等待回應再告知",desc:"你是多工天才，人生不是直線而是華麗的之字形冒險。你會跳過不必要的步驟，用最快速度到達終點。記得行動前通知身邊重要的人。",pct:"33%",sig:"滿足感＋平靜",notSelf:"挫敗＋憤怒",tips:"你的效率驚人，但「跳步驟」會讓別人跟不上。慢下來不是浪費時間。",energy:"你同時擁有薦骨持續能量和喉嚨顯化力。但不是每件事都需要你插手。"};if(s<.76)return{...base,type:"投射者",st:"等待邀請",desc:"你是天生的引導者，能看穿他人的天賦。你的能量不在做多少事，而在用智慧引導對的人。等待邀請不是被動——是深刻的自我信任。",pct:"21%",sig:"成功",notSelf:"苦澀感",tips:"最大的陷阱是沒被邀請就給建議。等待邀請時，你的智慧會被珍惜。注意能量有限，學會休息充電。",energy:"你沒有持續的薦骨能量，不適合高強度工作。你的超能力是「看見」別人看不見的東西。"};if(s<.92)return{...base,type:"顯示者",st:"告知",desc:"你是開路先鋒，擁有點燃火花、開啟新時代的能力。你不需要等待任何人的許可，唯一秘訣是行動前告知你在乎的人。",pct:"8%",sig:"平靜",notSelf:"憤怒",tips:"你的氣場是封閉的，別人可能覺得你難以接近。主動告知能減少阻力和誤解。",energy:"你擁有強大的爆發力和啟動能量。你來這世界就是為了打頭陣。"};return{...base,type:"反映者",st:"等待月亮週期",desc:"你是極其稀有的存在（僅佔1%），像一面清澈的鏡子。你會取樣周圍的能量，感受所有人的感受。給自己28天來做重大決策。",pct:"1%",sig:"驚喜",notSelf:"失望",tips:"你是社群健康的指標。選擇正確的環境對你至關重要。",energy:"你的能量完全取決於環境。在好環境中放大美好，在糟環境中承受負面。保護能量場是首要任務。"}}
const MSL=["紅龍","白風","藍夜","黃種子","紅蛇","白世界橋","藍手","黃星星","紅月","白狗","藍猴","黃人","紅天行者","白巫師","藍鷹","黃戰士","紅地球","白鏡","藍風暴","黃太陽"];
const MTN=["磁性","月亮","電力","自我存在","超頻","韻律","共振","銀河","太陽","行星","光譜","水晶","宇宙"];
const MDS={"紅龍":{c:"滋養與誕生",d:"孕育新開始的力量",g:"信任生命會照顧你",pw:"原始信任",ch:"過度照顧而忽略自己"},"白風":{c:"溝通與靈感",d:"宇宙訊息的傳遞者",g:"真實的表達是你的力量",pw:"呼吸與靈感",ch:"散漫缺乏方向"},"藍夜":{c:"豐盛與夢境",d:"透過夢接收宇宙訊息",g:"相信你的夢想",pw:"豐盛顯化",ch:"過度沉浸幻想"},"黃種子":{c:"開花與目標",d:"每個決定都會綻放",g:"最美的花需要最長時間",pw:"耐心與信念",ch:"過度期待結果"},"紅蛇":{c:"生命力與本能",d:"強大的生存智慧",g:"信任你的身體直覺",pw:"生命力",ch:"恐懼與執著"},"白世界橋":{c:"連接與放下",d:"不同世界的橋樑",g:"放下才能得到",pw:"連結超越",ch:"害怕改變"},"藍手":{c:"療癒與知曉",d:"雙手擁有療癒能量",g:"用雙手去創造療癒",pw:"療癒之手",ch:"過度控制"},"黃星星":{c:"美與藝術",d:"感知宇宙的和諧",g:"把美帶入日常生活",pw:"藝術創造",ch:"追求完美"},"紅月":{c:"淨化與流動",d:"水般的療癒力",g:"讓情緒像水一樣流動",pw:"淨化療癒",ch:"情緒氾濫"},"白狗":{c:"愛與忠誠",d:"心輪特別強大",g:"先學會無條件愛自己",pw:"忠誠之愛",ch:"過度付出"},"藍猴":{c:"遊戲與幻象",d:"看穿表象的智慧",g:"別把人生看太嚴肅",pw:"幽默魔法",ch:"逃避責任"},"黃人":{c:"自由意志",d:"獨立思考的勇氣",g:"勇敢做自己的選擇",pw:"自由意志",ch:"過度自我"},"紅天行者":{c:"探索與空間",d:"靈魂渴望穿越時空",g:"保持好奇心",pw:"空間旅行",ch:"無法安定"},"白巫師":{c:"永恆與魔法",d:"穿透時間幻象",g:"活在當下就是永恆",pw:"超越時間",ch:"操控"},"藍鷹":{c:"視野與創造",d:"從高處俯瞰全局",g:"先看清全貌再行動",pw:"遠見",ch:"脫離現實"},"黃戰士":{c:"智勇與提問",d:"戰士般的求知慾",g:"勇敢質疑",pw:"無畏探索",ch:"過度好鬥"},"紅地球":{c:"同步與導航",d:"與地球深刻連結",g:"跟隨生命的徵兆",pw:"共時性",ch:"執著控制"},"白鏡":{c:"真相與無盡",d:"映照事物本質",g:"接受真相",pw:"清晰洞察",ch:"過度批判"},"藍風暴":{c:"轉化與自我生成",d:"改變的催化劑",g:"擁抱變化",pw:"徹底轉化",ch:"破壞性"},"黃太陽":{c:"生命與開悟",d:"太陽般的光明",g:"讓光自然照耀",pw:"開悟之光",ch:"自我中心"}};
const MTD={"磁性":"統一吸引","月亮":"挑戰平衡","電力":"服務點亮","自我存在":"定義形式","超頻":"賦予力量","韻律":"組織平衡","共振":"連結通道","銀河":"整合完整","太陽":"意圖實現","行星":"完美顯化","光譜":"自由釋放","水晶":"合作凝聚","宇宙":"超越完成"};
function getMayan(y,m,d){const diff=Math.floor((new Date(y,m-1,d)-new Date(2006,0,14))/864e5);const k=((diff%260)+260)%260;const seal=MSL[k%20],tone=MTN[k%13];return{seal,tone,kin:k+1,d:MDS[seal],td:MTD[tone],guide:MSL[(k%20+12)%20],anti:MSL[(k%20+10)%20],occ:MSL[(k%20+18)%20]}}
function getBazi(y,m,d,h,solarY,solarM,solarD){const sy=solarY||y,sm=solarM||m,sd=solarD||d;const ysi=(y-4)%10,ybi=(y-4)%12,base=Math.floor((Date.UTC(sy,sm-1,sd)-Date.UTC(1900,0,7))/864e5),dsi=((base%10)+10)%10;const WX=["木","木","火","火","土","土","金","金","水","水"],dm=WX[dsi],yEl=WX[ysi];
  // Five element strengths based on pillars
  const wx5={木:0,火:0,土:0,金:0,水:0};wx5[dm]+=35;wx5[yEl]+=25;
  const mEl=WX[((ysi%5)*2+(m>1?m:m+12)-1)%10];wx5[mEl]+=20;
  const hIdx=Math.floor(h/2)%5;const hEl=["木","火","土","金","水"][hIdx];wx5[hEl]+=20;
  // Normalize
  const mx=Math.max(...Object.values(wx5));Object.keys(wx5).forEach(k=>wx5[k]=Math.round(wx5[k]/mx*95));
  // Weak element
  const weak=Object.entries(wx5).sort((a,b)=>a[1]-b[1])[0][0];
  const strong=Object.entries(wx5).sort((a,b)=>b[1]-a[1])[0][0];
  // Shishen (十神) talents based on day stem vs other stems
  const SS=["比肩","劫財","食神","傷官","偏財","正財","七殺","正官","偏印","正印"];
  const getSS=(a,b)=>SS[((b-a)%10+10)%10];
  const ss1=getSS(dsi,ysi),ss2=getSS(dsi,((ysi%5)*2+(m>1?m:m+12)-1)%10);
  const talents=[];const ssSet=new Set([ss1,ss2]);
  if(ssSet.has("傷官"))talents.push({name:"靈動的創作者",ss:"傷官",icon:"✦",desc:"你擁有打破常規的表達力與藝術直覺。在別人循規蹈矩時，你天生就能看見不同的風景。這份才華讓你在創作、設計、溝通方面有驚人的天賦。在愛情中，你渴望靈魂層面的共鳴，無法忍受一成不變的關係。"});
  if(ssSet.has("七殺"))talents.push({name:"無畏的開創者",ss:"七殺",icon:"☩",desc:"你內在有一股不服輸的狠勁，面對困境時反而越挫越勇。這股能量讓你天生適合開創新局，在別人猶豫時你已經在行動。職場上你是天生的革命家，愛情中你被那些有稜有角、不隨波逐流的靈魂深深吸引。"});
  if(ssSet.has("正印"))talents.push({name:"溫暖的守護者",ss:"正印",icon:"◈",desc:"你擁有海洋般的包容力，天生就是身邊人的安全港灣。你善於吸收知識，把複雜的事情消化後用最溫暖的方式傳遞出去。在職場上你是最好的導師和傾聽者，在愛情中你給予的安全感無可取代。"});
  if(ssSet.has("食神"))talents.push({name:"自在的享樂家",ss:"食神",icon:"❋",desc:"你天生懂得生活的美好，擁有敏銳的感官天賦。無論是美食、音樂、還是大自然，你都能從中汲取能量。你的存在讓周圍的人感到放鬆和愉悅，這是一種渾然天成的療癒力。"});
  if(ssSet.has("偏財"))talents.push({name:"靈活的冒險家",ss:"偏財",icon:"✧",desc:"你擁有敏銳的商業嗅覺和冒險精神。機會來臨時你能比別人更快嗅到，也更敢放手一搏。你的社交天賦讓你左右逢源，人脈就是你最大的財富。"});
  if(ssSet.has("正官"))talents.push({name:"優雅的統率者",ss:"正官",icon:"♛",desc:"你散發著不怒自威的氣場，天生就讓人信服。你重視規則和秩序，但不是死板——而是用優雅的方式讓一切井然有序。你適合管理、領導、法律等需要公信力的領域。"});
  if(ssSet.has("比肩"))talents.push({name:"堅毅的獨行者",ss:"比肩",icon:"▲",desc:"你擁有強大的自主意識和獨立精神。你不需要別人的認可來定義自己，靠自己的雙手打拼是你最大的驕傲。這份堅韌讓你在逆境中特別閃亮。"});
  if(ssSet.has("劫財"))talents.push({name:"豪爽的行動派",ss:"劫財",icon:"◆",desc:"你果斷、慷慨、說做就做。你的行動力是你最大的武器，猶豫不是你的風格。在朋友圈中你總是最仗義的那一個。"});
  if(ssSet.has("正財"))talents.push({name:"穩健的經營者",ss:"正財",icon:"◇",desc:"你天生具備守護和累積的能力。你做事踏實有條理，不追求一夜暴富，但你建立的一切都經得起時間考驗。你是家庭和團隊最可靠的支柱。"});
  if(ssSet.has("偏印"))talents.push({name:"神祕的洞察者",ss:"偏印",icon:"☽",desc:"你的思維方式跟多數人不同，你能看見別人看不見的真相。這份獨特的洞察力讓你在研究、玄學、創新領域有過人的天賦。你的直覺往往精準得令人驚訝。"});
  if(talents.length===0)talents.push({name:"溫暖的守護者",ss:"正印",icon:"◈",desc:"你擁有海洋般的包容力，天生就是身邊人的安全港灣。你善於吸收知識，把複雜的事情消化後用最溫暖的方式傳遞出去。"});
  // Year fortune
  const cyear=new Date().getFullYear();const lysi=(cyear-4)%10;const lySS=getSS(dsi,lysi);
  const fortuneKW={"比肩":"自我突破","劫財":"果斷行動","食神":"享受當下","傷官":"創意表達","偏財":"大膽嘗試","正財":"穩健累積","七殺":"勇敢蛻變","正官":"承擔責任","偏印":"深度學習","正印":"回歸初心"}[lySS]||"蓄勢待發";
  const s=hs(y,m,d,dsi);const sDesc=s>.6?"身強——內在能量充足，適合主動出擊。":s>.4?"中和——能量平衡，進退皆宜。":"身弱——需要外在支持，善用貴人的力量。";
  const rel={"木":{"火":"木生火——你的仁慈點燃他人的熱情","土":"木剋土——你的成長需要打破現狀","金":"金剋木——外在壓力磨練你的韌性","水":"水生木——直覺和智慧滋養你的根源","木":"比肩——你身邊有同類型的夥伴"},"火":{"土":"火生土——你的熱情創造穩固基礎","金":"火剋金——你的光芒能融化一切阻礙","水":"水剋火——情緒管理是一生課題","木":"木生火——身邊善意持續點燃你","火":"比肩——你的能量場吸引同頻的人"},"土":{"金":"土生金——你的穩定孕育珍貴成果","水":"土剋水——你的務實穩住情緒波動","木":"木剋土——在壓力中學會成長","火":"火生土——熱情是你的養分","土":"比肩——穩定人際是你的力量"},"金":{"水":"金生水——你的果斷帶來智慧流動","木":"金剋木——你的銳利需要學會柔軟","火":"火剋金——過度壓力讓你脆弱","土":"土生金——穩固基礎是成功關鍵","金":"比肩——志同道合的夥伴很重要"},"水":{"木":"水生木——你的智慧滋養身邊人成長","火":"水剋火——你的冷靜平息衝突","土":"土剋水——過多框架限制你的流動","金":"金生水——邏輯幫助你更有方向","水":"比肩——你需要同樣深度的人"}};
  return{yg:ST[ysi]+BR[ybi],dm,dmEl:WX[dsi],desc:"",dsi,ysi,yEl,rel:rel[dm]?.[yEl]||"能量互動",sDesc,wx5,weak,strong,talents:talents.slice(0,3),fortuneKW,lySS,s}}

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
  const[page,setPage]=useState("input"); // input, home, ziwei, bazi, zodiac, lifepath, humandesign, mayan, fortune
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
    "personality": "300字靈魂本質深度解讀",
    "career": "200字財運事業解讀",
    "love": "200字婚姻愛情解讀",
    "family": "150字家庭解讀",
    "noble": "150字貴人運解讀"
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
    const bgRef=useRef(null);
    const [nebulaBg,setNebulaBg]=useState(null);
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
  // ── BAZI PAGE ──
  if(page==="bazi"&&soul){
    const b=soul.bazi;
    const elEmoji={"木":"木","火":"火","土":"土","金":"金","水":"水"};
    const elPersona={"木":{title:"溫柔的參天大樹",p1:"你的靈魂本相是沉穩而充滿生機的「蒼翠之木」。你天生帶著一股向上生長的力量，就像春天裡最早抽芽的那棵樹——沉默、堅定，卻生機盎然。在人群中，你是那個不爭不搶，卻讓所有人都願意靠近的存在。你的溫柔不是軟弱，而是一種深植土壤的從容。",p2:"你在人際關係中扮演的角色往往是傾聽者和支撐者。朋友遇到困難時，你是第一個被想到的人。然而，大樹也會有枝葉過度繁茂而來不及自我修剪的時候——你常常在照顧別人的過程中忘了回頭看看自己。內心深處，你渴望被無條件接納，渴望有人不是因為你「有用」才靠近你。",p3:"能量保養建議：每週給自己一段「不被需要」的獨處時光。清晨在公園散步，赤腳踩在草地上，讓大地的能量重新灌注你的根系。綠色和棕色是你的能量色，翡翠或綠幽靈水晶能穩定你的心輪。"},"火":{title:"溫暖的微光燭火",p1:"你的靈魂本相是溫柔而明亮的「微光燭火」。你天生具備洞察人心的溫暖，總能在別人陷入低谷時，給予最安定的指引。在人群中，你或許不是最張揚的那一個，但絕對是最不可或缺的靈魂人物。你的笑容有一種魔力，能讓緊繃的空氣瞬間柔軟下來。",p2:"然而，燭火最怕的是風。你對環境的情緒極其敏感，別人不經意的一句話可能在你心裡燃燒好幾天。你的熱情如果沒有適當的邊界保護，很容易在不知不覺中燃燒耗竭。你有時會突然感到莫名的疲憊和空虛——那是因為你把光都給了別人，卻忘了留一盞給自己。",p3:"能量保養建議：每天為自己點一支蠟燭，在燭光前靜坐三分鐘，這不只是儀式，而是在提醒你的靈魂：你的光值得先照亮自己。紅色和紫色是你的能量色，紅紋石或石榴石能喚醒你的生命力。"},"土":{title:"包容的大地之母",p1:"你的靈魂本相是穩重而深厚的「厚德之土」。你像大地一樣承載著周圍人的喜怒哀樂，不動聲色地消化一切。你的存在給人一種安全感——只要你在，一切就不會太糟。你的耐心和包容力幾乎是無限的，這讓你成為朋友圈中最被信賴的人。",p2:"但大地長期承受壓力也會地震。你習慣把所有情緒都往下壓、往內吞，表面看起來雲淡風輕，內心可能早已暗潮洶湧。你最大的課題不是學會更堅強，而是學會示弱——允許自己偶爾崩塌，才能在廢墟上建造更真實的自己。",p3:"能量保養建議：每週花時間接觸陶土或烹飪，讓雙手與「土」的元素產生連結。黃色和米色是你的能量色，黃水晶或虎眼石能為你帶來溫暖的自信。"},"金":{title:"清銳的光明之劍",p1:"你的靈魂本相是鋒利而純淨的「清銳之金」。你擁有一雙能穿透虛偽的眼睛，在混亂的世界裡，你總能迅速辨別什麼是真、什麼是假。你說話直接、行事果斷，不喜歡拐彎抹角。你的正義感和原則性讓你在關鍵時刻成為最可靠的決策者。",p2:"金的另一面是孤獨。你的高標準有時會讓身邊的人感到壓力，而你自己也常因為「世界不夠完美」而感到失望。你在人際關係中最大的挑戰是學會接受不完美——包括自己的不完美。當你放下那把隨時準備審判的劍，你會發現世界溫柔了許多。",p3:"能量保養建議：嘗試接觸一些柔軟的活動——水彩畫、瑜伽、或者單純地擁抱一個你信任的人。白色和金色是你的能量色，白水晶或月光石能柔化你的銳氣。"},"水":{title:"深邃的幽靈之泉",p1:"你的靈魂本相是幽深而靈動的「幽深之水」。你的內在像一座深不見底的湖泊，表面平靜無波，底下卻蘊藏著驚人的智慧和直覺。你天生就能感知到別人隱藏的情緒和未說出口的心事。你的感受力是你最強大的天賦，也是你最脆弱的軟肋。",p2:"水最大的特質是無形——你可以適應任何容器，也因此容易在不同的環境中迷失自己。你有時會發現自己在不同的人面前展現完全不同的面貌，久了甚至忘記哪一個才是「真正的自己」。你最深層的渴望是被完整地看見，不是某一面的你，而是全部的你。",p3:"能量保養建議：每天花五分鐘做自由書寫，不需要邏輯、不需要結構，讓水一樣的思緒自由流淌。藍色和黑色是你的能量色，海藍寶或拉長石能增強你的直覺力。"}};
    const ep=elPersona[b.dmEl]||elPersona["火"];
    const weakAdv={"木":"要喚醒木的能量，建議在居家空間增加綠色植物，每天散步時觀察大自然的生長節奏。穿著森林綠的服飾，佩戴翡翠或綠東陵，能幫助你重建生長和擴展的力量。","火":"要喚醒火的能量，建議每天早起看一次日出，或者在桌上放一盞暖色調的燈。紅色和橙色的服飾能提振你的行動力，紅紋石或紅碧璽能點燃你內在沉睡的熱情。","土":"要喚醒土的能量，建議嘗試手作陶藝或下廚烹飪。赤腳踩在土地上能快速補充這股能量。黃色和棕色的服飾、黃水晶或虎眼石，都能幫助你找回穩定的根基。","金":"要喚醒金的能量，建議整理你的居住空間，丟掉不再需要的物品。簡潔的秩序能召喚金的清明之氣。白色和銀色的服飾、白水晶或月光石能強化你的判斷力和決斷力。","水":"要喚醒水的能量，建議本週嘗試自由書寫，或者在睡前聽流水聲的白噪音冥想。多穿著海水藍或深靛色的服飾，海藍寶或拉長石能增強你的直覺和流動性。"}[b.weak];
    const yr=new Date().getFullYear();
    const fortuneActions={"比肩":["每天寫下一個「只為自己」的小目標","找一位同頻的夥伴一起成長","重新審視你的核心價值觀"],"劫財":["果斷處理一件拖延已久的事","學習說「不」的藝術","把能量集中在最重要的三件事上"],"食神":["每週至少安排一次「純粹享受」的時光","嘗試一個新的興趣或手作","用五感去感受日常的美好"],"傷官":["開始一個全新的創作計畫","勇敢表達那些藏在心底的想法","報名一堂你一直感興趣的課程"],"偏財":["大膽嘗試一個新的收入來源","主動聯繫三位很久沒見的朋友","記錄你的財務流向並制定計畫"],"正財":["開一個專屬的儲蓄帳戶","在現有的工作中深耕專業","建立你的日常健康習慣"],"七殺":["勇敢面對你一直在逃避的事","設定一個超出舒適圈的挑戰","斷捨離不再服務你的關係或習慣"],"正官":["承擔一個領導角色或專案","建立更有紀律的作息","學習一項能提升專業公信力的技能"],"偏印":["每天花20分鐘閱讀一本深度書籍","探索一個冷門但令你著迷的領域","練習冥想或自我覺察日記"],"正印":["回去拜訪一位對你影響深遠的師長","學習一項新知識或報名課程","給自己安排一趟回歸本心的旅行"]}[b.lySS]||["保持覺察","照顧好自己","相信宇宙的安排"];
    const wxArr=["木","火","土","金","水"].map(e=>({e,v:b.wx5[e]})).sort((a,c)=>c.v-a.v);
    const top2=new Set([wxArr[0].e,wxArr[1].e]);
    return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Noto Serif SC','STSong',serif",color:C.txt}}><Stars/><Nav/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px 50px",position:"relative",zIndex:1}}>
        <PB icon="🎋" title="八字能量解碼"/>
        {/* ══ 區塊一 ══ */}
        <Glass style={{textAlign:"center",marginBottom:20,padding:"32px 22px"}}>
          <div style={{fontSize:"2.8rem",marginBottom:8,fontWeight:100,color:C.gold,textShadow:"0 0 30px rgba(212,165,116,.4), 0 0 60px rgba(212,165,116,.15)",letterSpacing:".3em",fontFamily:"'Noto Serif SC',serif"}}>{b.dmEl}</div>
          <div style={{fontSize:"1.25rem",fontWeight:700,color:C.gold,marginBottom:6}}>{ep.title}</div>
          <div style={{fontSize:".88rem",color:"rgba(255,255,255,.65)"}}>
            <TT setTtip={setTtip} term="日主天干" def="八字中代表「你自己」的核心符號。由出生日的天干決定，是整個命盤的靈魂中心。">靈魂本相</TT>：{b.dmEl} ｜ 年柱 {b.yg}（{b.yEl}）
          </div>
        </Glass>
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:C.gold,letterSpacing:".12em",marginBottom:14}}>✦ 靈魂本質光譜</div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)"}}>{aiReading?.bazi?.personality||ep.p1}</div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)",marginTop:14}}>{aiReading?.bazi?.personality?null:ep.p2}</div>
          <div style={{fontSize:".92rem",lineHeight:2.1,color:"rgba(255,255,255,.85)",marginTop:14,padding:"14px 16px",borderRadius:12,background:"rgba(212,165,116,.06)",borderLeft:"3px solid rgba(212,165,116,.3)"}}>{aiReading?.bazi?.personality?null:ep.p3}</div>
        </Glass>
        {/* ══ 區塊二 ══ */}
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:C.rose,letterSpacing:".12em",marginBottom:16}}>◌ 內在元素共舞</div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:18}}><Radar labels={["木","火","土","金","水"]} values={[b.wx5.木,b.wx5.火,b.wx5.土,b.wx5.金,b.wx5.水]} size={220}/></div>
          <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap",marginBottom:18}}>
            {["木","火","土","金","水"].map(e=>{const lit=top2.has(e);return <div key={e} style={{textAlign:"center",opacity:lit?1:.35,transition:"all .3s"}}><div style={{width:46,height:46,borderRadius:23,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".88rem",fontWeight:700,background:lit?"rgba(212,165,116,.18)":"rgba(255,255,255,.03)",border:lit?"1.5px solid rgba(212,165,116,.5)":"1.5px solid rgba(255,255,255,.08)",color:lit?C.gold:"rgba(255,255,255,.3)"}}>{e}</div><div style={{fontSize:".72rem",color:lit?"rgba(255,255,255,.7)":"rgba(255,255,255,.25)",marginTop:4,fontWeight:lit?600:400}}>{b.wx5[e]}%</div></div>})}
          </div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)"}}>
            在你的內在宇宙中，<TT setTtip={setTtip} term="五行" def="金、木、水、火、土五種能量，代表宇宙萬物運行的基本力量。每個人體內都有這五種能量的獨特配比。">五行</TT>的能量呈現出獨特的分佈。「{wxArr[0].e}」與「{wxArr[1].e}」是你最豐盛的兩股能量，分別賦予了你{wxArr[0].e==="木"?"強大的生命力與成長潛能":wxArr[0].e==="火"?"驚人的熱情與感染力":wxArr[0].e==="土"?"深厚的穩定性與承載力":wxArr[0].e==="金"?"銳利的判斷力與執行力":"敏銳的直覺與適應力"}，以及{wxArr[1].e==="木"?"持續向上的生長動能":wxArr[1].e==="火"?"溫暖明亮的行動力":wxArr[1].e==="土"?"踏實穩固的安全感":wxArr[1].e==="金"?"清晰果斷的辨別力":"靈活變通的適應性"}。
          </div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)",marginTop:10}}>
            然而，代表「{b.weak}」的能量目前處於休眠狀態。在<TT setTtip={setTtip} term="相生相剋" def="五行之間的互動關係：木生火、火生土、土生金、金生水、水生木（相生）；木剋土、土剋水、水剋火、火剋金、金剋木（相剋）。">相生相剋</TT>的循環中，這可能讓你近期感到某些面向的失衡。
          </div>
          <div style={{fontSize:".92rem",lineHeight:2.1,color:"rgba(255,255,255,.82)",marginTop:14,padding:"14px 16px",borderRadius:12,background:"rgba(130,180,200,.06)",borderLeft:"3px solid rgba(130,180,200,.3)"}}>
            ✦ 調頻建議：{weakAdv}
          </div>
        </Glass>
        {/* ══ 區塊三 ══ */}
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:C.purp,letterSpacing:".12em",marginBottom:16}}>◈ 潛藏的靈魂天賦</div>
          <div style={{fontSize:".9rem",color:"rgba(255,255,255,.6)",marginBottom:14}}>你的命盤中，<TT setTtip={setTtip} term="十神" def="八字中描述你與周圍能量關係的十種角色。它們代表你天生的才華、行為模式和人生主題。">十神</TT>揭示了你獨特的超能力組合：</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {b.talents.map((t,i)=><div key={i} style={{padding:"18px 20px",borderRadius:14,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.08)",position:"relative"}}>
              <div style={{position:"absolute",right:14,top:14,fontSize:"2rem",opacity:.04,color:C.gold}}>{t.icon}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:"1.4rem",color:C.gold,textShadow:"0 0 12px rgba(212,165,116,.3)"}}>{t.icon}</span>
                <span style={{fontSize:"1.05rem",fontWeight:700,color:C.gold}}><TT setTtip={setTtip} term={t.name} def={`傳統八字稱「${t.ss}」。${t.ss==="傷官"?"代表才華洋溢、打破常規與極強的表達渴望。":t.ss==="七殺"?"代表突破框架、行動力與挑戰權威的能量。":t.ss==="正印"?"代表包容、吸收知識、母性與無私的奉獻。":t.ss==="食神"?"代表享受生活、感官天賦與天然的療癒力。":t.ss==="偏財"?"代表冒險精神、社交天賦與靈活的商業嗅覺。":t.ss==="正官"?"代表紀律、公信力與天生的領導氣質。":t.ss==="比肩"?"代表獨立自主、堅韌不拔的自我力量。":t.ss==="劫財"?"代表果斷行動、慷慨豪爽的執行力量。":t.ss==="正財"?"代表穩健累積、踏實守護的經營能力。":"代表獨特洞察、直覺敏銳的思維天賦。"}`}>{t.name}</TT></span>
              </div>
              <div style={{fontSize:".93rem",lineHeight:2,color:"rgba(255,255,255,.85)"}}>{t.desc}</div>
            </div>)}
          </div>
        </Glass>
        {/* ══ 區塊四：財運官運 ══ */}
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:"#e8c170",letterSpacing:".12em",marginBottom:16}}>✧ 財運與事業格局</div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)"}}>
            {b.dmEl==="木"?"木主仁，你的財運來自於「土」——穩紮穩打、經營人脈。你不適合投機取巧，反而是那種越耕耘越豐收的類型。事業上，你的成長像大樹一樣需要時間紮根，但一旦站穩，便枝繁葉茂、難以撼動。適合你的領域包括教育、文創、醫療健康、農業或任何需要長期深耕的行業。你的財富密碼是「耐心」——別急著收割，讓時間替你累積複利。":b.dmEl==="火"?"火主禮，你的財運來自於「金」——精準判斷、果斷出手。你天生具備敏銳的商業嗅覺，能在混亂中看見機會。事業上，你適合站在舞台前方，用你的熱情和感染力帶動團隊。適合的領域包括行銷、娛樂、餐飲、科技創新或任何需要開創性的行業。你的財富密碼是「行動力」——想到就做，但記得保留三成資金作為安全墊。":b.dmEl==="土"?"土主信，你的財運來自於「水」——靈活變通、善抓趨勢。你是天生的資源整合者，懂得把不起眼的東西變成寶藏。事業上，你的優勢在於穩定和信任感，別人願意把重要的事託付給你。適合的領域包括房地產、金融理財、人力資源、物流或任何需要信用基礎的行業。你的財富密碼是「信用」——你的口碑就是最大的資產。":b.dmEl==="金"?"金主義，你的財運來自於「木」——開拓新局、創造價值。你對品質有極高的要求，這讓你在專業領域中容易脫穎而出。事業上，你適合擔任決策者或專業顧問角色，你的判斷力是團隊最寶貴的資產。適合的領域包括法律、財務、工程、科技、奢侈品或任何講究精準和品質的行業。你的財富密碼是「專業」——把一件事做到極致，財富自然追隨。":"水主智，你的財運來自於「火」——點燃熱情、創造影響力。你的腦袋裡永遠有別人想不到的點子，這是你最珍貴的財富來源。事業上，你適合做幕後策劃者或創意總監，用智慧引導方向。適合的領域包括諮詢、研究、寫作、投資分析或任何需要洞察力的行業。你的財富密碼是「洞見」——當別人還在看表面，你已經看透了本質。"}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
            {(b.dmEl==="木"?[["⟐","深耕型"],["⟡","人脈型"],["⟢","知識型"]]:b.dmEl==="火"?[["⟐","開創型"],["⟡","行動型"],["⟢","靈感型"]]:b.dmEl==="土"?[["⟐","整合型"],["⟡","信用型"],["⟢","穩健型"]]:b.dmEl==="金"?[["⟐","專精型"],["⟡","品質型"],["⟢","策略型"]]:[["⟐","智慧型"],["⟡","洞察型"],["⟢","變通型"]]).map(([ic,lb],i)=><div key={i} style={{flex:1,minWidth:80,textAlign:"center",padding:"10px 8px",borderRadius:10,background:"rgba(232,193,112,.06)",border:"1px solid rgba(232,193,112,.15)"}}><div style={{fontSize:"1.1rem",marginBottom:4,color:"inherit",textShadow:"0 0 8px currentColor",opacity:.7}}>{ic}</div><div style={{fontSize:".78rem",color:C.gold,fontWeight:600}}>{lb}</div></div>)}
          </div>
        </Glass>
        {/* ══ 區塊五：婚姻愛情 ══ */}
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:"#e8a0b0",letterSpacing:".12em",marginBottom:16}}>❖ 婚姻與愛情藍圖</div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)"}}>
            {b.dmEl==="木"?"在愛情中，你是那棵願意為對方遮風擋雨的大樹。你的愛深沉而持久，不會輕易說出口，卻會用行動默默守護。你最理想的伴侶是能讓你安心展露脆弱的人——不是需要你保護的人，而是能與你並肩而立的人。你在感情中最大的課題是「表達需求」：你太習慣給予，卻忘了自己也值得被照顧。當你學會開口說「我需要你」，你的親密關係將會迎來質的飛躍。桃花較旺的時節通常在春夏之交，水元素旺的年份容易遇到心動的對象。":b.dmEl==="火"?"在愛情中，你是那盞為對方點亮整個世界的燭火。你的愛熱烈而直接，墜入愛河時全世界都看得出來。你最理想的伴侶是能包容你的情緒波動、又不會被你的光芒灼傷的人。你在感情中最大的課題是「保持自我」：你太容易在愛中迷失自己，把所有能量都燃燒給對方。記住，最健康的愛情是兩盞燭火互相輝映，而不是一方燃盡自己去照亮另一方。金元素旺的年份感情較穩定，秋季容易遇到靈魂伴侶的線索。":b.dmEl==="土"?"在愛情中，你是那片讓對方感到安全的大地。你的愛溫暖而包容，不管對方經歷什麼風暴，在你身邊總能找到安定。你最理想的伴侶是能主動靠近你、打開你心門的人——因為你太擅長把自己封閉在堅固的城牆裡。你在感情中最大的課題是「允許被愛」：你總覺得自己要先變得足夠好才值得被愛，但真正愛你的人，愛的就是此刻不完美的你。火元素旺的年份桃花運最旺，夏季的社交場合容易邂逅有緣人。":b.dmEl==="金"?"在愛情中，你是那把鋒利卻溫柔的劍。你對伴侶的要求很高，因為你對自己的要求也一樣高。你最理想的伴侶是能欣賞你的銳利、同時軟化你的稜角的人。你在感情中最大的課題是「接受不完美」：你有時會因為對方的一個小缺點就想放棄整段關係。但完美的愛情不存在，完美的默契是磨合出來的。當你放下評判、學會欣賞差異，你會發現愛情比你想像的更溫柔。水元素旺的年份情感最豐沛，冬季是你反思和深化關係的最佳時期。":"在愛情中，你是那座深不見底的湖泊。你的愛深邃而神秘，對方永遠猜不透你心裡在想什麼，這既是你的魅力，也是你的困擾。你最理想的伴侶是有耐心慢慢走進你內心的人——不是強行闖入，而是願意在湖邊安靜等待的人。你在感情中最大的課題是「信任」：你太害怕受傷，所以築起層層防線。但真正的親密需要冒險。木元素旺的年份感情有新的萌芽，春季是展開新關係的好時機。"}
          </div>
          <div style={{marginTop:14,padding:"14px 16px",borderRadius:12,background:"rgba(232,160,176,.06)",borderLeft:"3px solid rgba(232,160,176,.25)"}}>
            <div style={{fontSize:".82rem",color:"#e8a0b0",fontWeight:600,marginBottom:6}}>✦ 愛情能量提示</div>
            <div style={{fontSize:".88rem",lineHeight:1.9,color:"rgba(255,255,255,.78)"}}>
              {b.dmEl==="木"?"佩戴粉水晶或草莓晶能柔化你的木質剛性，增添柔情。約會時選擇有綠意的戶外場所，是你最自然放鬆的環境。":b.dmEl==="火"?"佩戴月光石能平衡你過於熾熱的情感能量。約會時避免太過刺激的場所，選擇能靜靜對話的空間更能展現你的深度。":b.dmEl==="土"?"佩戴紅紋石能打開你封閉的心輪。嘗試主動分享你的感受，哪怕只是一句「今天想你了」，都能讓關係升溫。":b.dmEl==="金"?"佩戴粉碧璽能軟化你的完美主義傾向。試著在約會時放下手機和待辦清單，全然地活在當下。":"佩戴海藍寶能幫助你表達深藏的情感。寫一封手寫信給重要的人，文字是你最擅長的愛的語言。"}
            </div>
          </div>
        </Glass>
        {/* ══ 區塊六：家庭 ══ */}
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:"#a0c8a0",letterSpacing:".12em",marginBottom:16}}>◇ 家庭與根源能量</div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)"}}>
            {b.dmEl==="木"?"你的家庭能量根植於「生長」的主題。在原生家庭中，你可能是那個默默承擔責任的角色——像一棵小樹苗過早地學會了支撐。這份早熟讓你比同齡人更成熟穩重，但也可能讓你在內心深處藏著一個渴望被照顧的小孩。在你未來建立的家庭中，你會是溫柔而堅定的存在。你的孩子（或未來的孩子）會在你身上學到什麼叫做「安全感」。但請記住，最好的家庭教育不是犧牲自己，而是讓家人看到一個活得自在的你。":b.dmEl==="火"?"你的家庭能量圍繞著「溫暖」的主題。在原生家庭中，你可能是氣氛調節者——家裡有你在就不會冷場。但這也意味著你從小就學會了察言觀色，用自己的光去填補家庭裡的暗角。在你未來建立的家庭中，你會創造一個充滿歡笑和儀式感的家。你相信節日要好好過、生日要有驚喜、平凡的日子也要有小確幸。但別忘了，偶爾讓家人也來照顧你的情緒，你不需要永遠是那個發光的人。":b.dmEl==="土"?"你的家庭能量建立在「穩定」的基石上。在原生家庭中，你可能是所有人的依靠——不管發生什麼事，家人第一個想到的就是你。這份被需要感讓你感到存在的價值，但有時也會成為沉重的負擔。在你未來建立的家庭中，你會打造一個溫馨而有秩序的港灣。你重視傳統、珍惜團聚，週末的家庭餐桌對你來說比任何社交場合都重要。但別把「為家人好」當成控制的藉口，最好的愛是給彼此自由生長的空間。":b.dmEl==="金"?"你的家庭能量聚焦於「教養」的主題。在原生家庭中，你可能經歷了嚴格的管教或高標準的期望——這塑造了你追求卓越的性格，但也可能讓你對「不夠好」有深層的恐懼。在你未來建立的家庭中，你會是有原則、有底線的家長或伴侶。你的家規清晰，對孩子的教育有明確的方向。但請記住，比起完美的成績單，孩子更需要的是一個會說「沒關係，我愛你本來的樣子」的父母。":"你的家庭能量流動於「理解」的主題。在原生家庭中，你可能是最敏感的那個——家裡的情緒暗流，你全都感受得到。這份敏銳讓你很早就學會了閱讀空氣，但也可能讓你承受了不該承受的情緒重量。在你未來建立的家庭中，你會創造一個重視心靈交流的空間。你不在乎房子多大、車子多好，你在乎的是「家人之間能不能說真話」。你的直覺會讓你成為最懂孩子心事的父母，但記得也要教他們面對現實的勇氣。"}
          </div>
          <div style={{marginTop:14,padding:"14px 16px",borderRadius:12,background:"rgba(160,200,160,.06)",borderLeft:"3px solid rgba(160,200,160,.25)"}}>
            <div style={{fontSize:".82rem",color:"#a0c8a0",fontWeight:600,marginBottom:6}}>✦ 家庭和諧小儀式</div>
            <div style={{fontSize:".88rem",lineHeight:1.9,color:"rgba(255,255,255,.78)"}}>
              {b.dmEl==="木"?"在家中東方擺放一盆生命力旺盛的綠色植物，象徵家庭的持續生長。每週安排一次「不談責任」的家庭時光，單純享受在一起的快樂。":b.dmEl==="火"?"在客廳點一盞暖色調的燈或蠟燭，讓家的溫度看得見。建立一個家庭傳統——可以是週五電影夜，也可以是每月一次的家庭手作時間。":b.dmEl==="土"?"在餐桌上擺放一個陶製花瓶，象徵家的穩固根基。每週至少一次全家共餐，不看手機、不談工作，只專注於彼此。":b.dmEl==="金"?"在家中西方放置一件金屬或白色水晶擺件，象徵清明的家庭能量。學習用「我覺得…」代替「你應該…」來表達對家人的期望。":"在家中北方放置一個小型流水擺設，象徵家庭情感的流動。建立「心情分享」的睡前儀式，讓每個家人都有被聽見的機會。"}
            </div>
          </div>
        </Glass>
        {/* ══ 區塊七：貴人運 ══ */}
        <Glass style={{marginBottom:20,padding:"24px 22px"}}>
          <div style={{fontSize:".88rem",color:"#a0b8e0",letterSpacing:".12em",marginBottom:16}}>☆ 貴人與機緣地圖</div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.88)"}}>
            {b.dmEl==="木"?"你的貴人往往是「水」屬性的人——他們滋養你、支持你的成長，卻不求回報。在生活中，這類貴人可能是那些思維靈活、情感豐富的人：心理諮詢師、藝術家、研究學者，或者是那個總是在你迷茫時打電話給你的老友。你的貴人方位在北方，水元素旺的季節（冬季）容易遇到生命中的關鍵助力。值得注意的是，你的貴人不一定是地位比你高的人——有時候一個真誠的晚輩或學生，反而能帶給你最重要的人生啟發。":b.dmEl==="火"?"你的貴人往往是「木」屬性的人——他們像燃料一樣助你燃燒得更旺。在生活中，這類貴人可能是有遠見的導師、充滿生命力的創業者，或者是那些不斷鼓勵你「再大膽一點」的朋友。你的貴人方位在東方，木元素旺的季節（春季）最容易遇到改變你命運的人。你的人際磁場本就很強，但真正的貴人不是被你的光吸引來的粉絲，而是能在你燃燒殆盡時遞上柴火的人。":b.dmEl==="土"?"你的貴人往往是「火」屬性的人——他們點燃你的熱情、喚醒你沉睡的行動力。在生活中，這類貴人可能是充滿幹勁的領導者、敢衝敢闖的開拓者，或者是那個總是說「走吧，試試看」的冒險型朋友。你的貴人方位在南方，火元素旺的季節（夏季）機緣最多。你的穩重會讓很多人信任你，但你需要的貴人不是更多讓你承擔的人，而是能推動你走出舒適圈的人。":b.dmEl==="金"?"你的貴人往往是「土」屬性的人——他們用包容和耐心軟化你的銳利。在生活中，這類貴人可能是溫和的長輩、踏實的合作夥伴，或者是那個在你過於嚴苛時輕輕說「別太為難自己」的人。你的貴人方位在中央和西南方，土元素旺的季節（四季交替之際）容易遇到命中的助力。別把貴人想像成帶你飛的人——對你來說，能讓你慢下來、柔軟下來的人，才是真正的貴人。":"你的貴人往往是「金」屬性的人——他們用清晰的邏輯幫你理清混沌的思緒。在生活中，這類貴人可能是做事有條理的專業人士、嚴謹但公正的導師，或者是那個在你飄忽不定時幫你做決定的果斷朋友。你的貴人方位在西方，金元素旺的季節（秋季）容易迎來重要的人生轉機。你的直覺很強，但有時候會因為選擇太多而陷入猶豫——你的貴人就是那個幫你「一刀切下去」的人。"}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
            {(b.dmEl==="木"?[["☽","水系貴人"],["◎","北方"],["❆","冬季"]]:b.dmEl==="火"?[["❋","木系貴人"],["◎","東方"],["❀","春季"]]:b.dmEl==="土"?[["◆","火系貴人"],["◎","南方"],["✺","夏季"]]:b.dmEl==="金"?[["◈","土系貴人"],["◎","西南"],["❋","季節交替"]]:b.dmEl==="水"?[["☩","金系貴人"],["◎","西方"],["❆","秋季"]]:[]).map(([ic,lb],i)=><div key={i} style={{flex:1,minWidth:80,textAlign:"center",padding:"10px 8px",borderRadius:10,background:"rgba(160,184,224,.06)",border:"1px solid rgba(160,184,224,.15)"}}><div style={{fontSize:"1.1rem",marginBottom:4,color:"inherit",textShadow:"0 0 8px currentColor",opacity:.7}}>{ic}</div><div style={{fontSize:".78rem",color:"#a0b8e0",fontWeight:600}}>{lb}</div></div>)}
          </div>
          <div style={{marginTop:14,padding:"14px 16px",borderRadius:12,background:"rgba(160,184,224,.06)",borderLeft:"3px solid rgba(160,184,224,.25)"}}>
            <div style={{fontSize:".82rem",color:"#a0b8e0",fontWeight:600,marginBottom:6}}>✦ 招貴人秘訣</div>
            <div style={{fontSize:".88rem",lineHeight:1.9,color:"rgba(255,255,255,.78)"}}>
              {b.dmEl==="木"?"主動參加讀書會或身心靈社群，你的貴人常出現在知識交流的場合。隨身攜帶藍色系飾品能增強貴人磁場。":b.dmEl==="火"?"多參與戶外活動或創業社群，你的貴人常出現在充滿活力的場合。在東方窗台放一盆生長旺盛的植物能催旺貴人運。":b.dmEl==="土"?"嘗試參加需要走出舒適圈的活動或工作坊，你的貴人常出現在你「不太習慣」的場合。佩戴紅色系飾品能增強貴人緣。":b.dmEl==="金"?"多出席溫馨的聚會場合而非競爭性活動，你的貴人常出現在放鬆的環境中。在辦公桌放一個陶製小物能穩定貴人磁場。":"定期整理和清潔你的居住環境，乾淨有序的空間能招來金系貴人。佩戴白水晶或銀色飾品能增強你的貴人運。"}
            </div>
          </div>
        </Glass>
        {/* ══ 區塊八：流年指引 ══ */}
        <Glass style={{padding:"28px 22px",background:"linear-gradient(135deg,rgba(212,165,116,.05),rgba(180,130,180,.05))"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:"1.6rem",marginBottom:8,color:C.rose,textShadow:"0 0 20px rgba(176,112,128,.3)"}}>✧</div>
            <div style={{fontSize:".88rem",color:C.rose,letterSpacing:".12em"}}>寫給 {yr} 年的你</div>
          </div>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:".82rem",color:"rgba(255,255,255,.55)",marginBottom:6}}><TT setTtip={setTtip} term="流年" def="每一年的天干地支組成的能量場，會與你的命盤產生獨特的共振，影響這一年的主要課題和機遇。">流年</TT>年度關鍵字</div>
            <div style={{display:"inline-block",padding:"10px 28px",borderRadius:22,background:"rgba(212,165,116,.1)",border:"1.5px solid rgba(212,165,116,.35)",fontSize:"1.25rem",fontWeight:700,color:C.gold,letterSpacing:".22em"}}>{b.fortuneKW}</div>
          </div>
          <div style={{fontSize:".95rem",lineHeight:2.1,color:"rgba(255,255,255,.85)",textAlign:"center",marginBottom:18}}>
            今年的宇宙能量主題是「{b.fortuneKW}」。{b.lySS==="七殺"?"這是一個破舊立新的年份，過去拖住你的一切，今年都可以勇敢放手。":b.lySS==="傷官"?"你的創造力將在今年達到巔峰，勇敢表達內心的聲音。":b.lySS==="正印"?"今年適合沉澱和學習，回到內心最真實的渴望。":b.lySS==="食神"?"今年的你值得好好享受生活，幸福會從微小的日常中綻放。":"今年是蓄力的一年，每一步都在為未來的綻放鋪路。"}
          </div>
          <div style={{fontSize:".85rem",color:C.gold,letterSpacing:".1em",marginBottom:10,textAlign:"center"}}>三個微小行動指南</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {fortuneActions.map((a,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,.025)"}}><span style={{fontSize:".92rem",color:C.gold,fontWeight:700,minWidth:20}}>{i+1}.</span><span style={{fontSize:".92rem",lineHeight:1.9,color:"rgba(255,255,255,.85)"}}>{a}</span></div>)}
          </div>
        </Glass>
      </div>
      {ttip&&<div onClick={()=>setTtip(null)} style={{position:"fixed",inset:0,zIndex:99998}}><div style={{position:"fixed",top:ttip.top,left:ttip.left,background:"rgba(18,14,28,.97)",border:"1px solid rgba(212,165,116,.4)",borderRadius:12,padding:"14px 18px",fontSize:".88rem",lineHeight:1.9,color:"rgba(255,255,255,.9)",width:260,zIndex:99999,boxShadow:"0 8px 36px rgba(0,0,0,.75)"}} onClick={e=>e.stopPropagation()}><div style={{color:C.gold,fontWeight:600,fontSize:".85rem",marginBottom:6}}>{ttip.term}</div>{ttip.def}</div></div>}
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
