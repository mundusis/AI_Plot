import{d as f}from"./createLucideIcon-DiLkD9X9.js";import{N as S,k as d,l as $}from"./index-CpNDltMZ.js";const y=S("session",()=>{const u=d(null),a=d(null),n=d(!1),e=d(0);let i=null;function o(){n.value=!0,e.value=0,i=setInterval(()=>{e.value++},1e3)}function s(){n.value=!1,i&&(clearInterval(i),i=null)}return{currentArchiveId:u,selectedApiId:a,isGenerating:n,generatingSeconds:e,startGenerating:o,stopGenerating:s}});async function k(u){const a=await f.archives.get(u);if(!a)return"";const n=[];a.promptStory&&n.push(a.promptStory);for(const s of a.referencedSystemConfigKeys){const t=await f.systemConfigs.get(s);t&&n.push(`【${t.key}】
${t.value}`)}for(const s of a.privateConfigs)n.push(`【${s.key}】
${s.value}`);a.worldSetting&&n.push(`【初始世界观】
${a.worldSetting}`);for(const s of a.worldConfigs)n.push(`【${s.key}】
${s.value}`);const e=[];for(const s of a.referencedSystemRoleIds){const t=await f.characterRoles.get(s);t&&e.push(t)}const i=await f.characterRoles.where({archiveId:u}).sortBy("sortOrder");for(const s of i)e.some(t=>t.id===s.id)||e.push(s);if(e.length>0){const s=[];for(const t of e){const r=[];r.push(`【角色名称】${t.name}`),t.age&&r.push(`年龄：${t.age}`),t.gender&&r.push(`性别：${t.gender}`),t.personality&&r.push(`性格：${t.personality}`),t.specialAbilities&&r.push(`特殊能力：${t.specialAbilities}`),t.preferences&&r.push(`喜好：${t.preferences}`),t.intro&&r.push(`简介：${t.intro}`),t.family&&r.push(`家庭：${t.family}`),t.specialNotes&&r.push(`特殊备注：${t.specialNotes}`),s.push(r.join(`
`))}n.push(`【角色设定】
${s.join(`

`)}`)}const o=a.memory;return(o.currentStatus||o.plotLine||o.characterRelations||o.pendingIssues||o.keyInfo)&&n.push(`【当前剧情记忆】
[当前状态]${o.currentStatus}
[完整剧情进展]${o.plotLine}
[完整角色关系]${o.characterRelations}
[待解决问题]${o.pendingIssues}
[关键信息]${o.keyInfo}`),n.join(`

`)}async function I(u){return(await f.messages.where({archiveId:u,summaryStatus:"未操作"}).sortBy("timestamp")).map(n=>({role:n.role,content:n.content}))}async function w(u,a,n,e){var m,c,h,l;const i=y(),o=e??i.selectedApiId??void 0,s=o!==void 0?await f.apiConfigs.get(o):void 0;if(!s)throw new Error("未选择 API 配置");const t=[{role:"system",content:a},...n],r=await fetch(`${s.baseUrl}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.apiKey}`},body:JSON.stringify({model:s.model,temperature:s.temperature,messages:t})});if(!r.ok)throw new Error(`API 请求失败: ${r.status}`);const p=await r.json();return{content:p.choices[0].message.content,usage:{promptTokens:((m=p.usage)==null?void 0:m.prompt_tokens)??0,cachedTokens:((h=(c=p.usage)==null?void 0:c.prompt_tokens_details)==null?void 0:h.cached_tokens)??0,completionTokens:((l=p.usage)==null?void 0:l.completion_tokens)??0}}}function T(){async function u(e,i){const o=y(),s=$();o.startGenerating();try{const t=await k(e),r=await I(e);i&&r.push({role:"user",content:i});const p=await w(e,t,r),m=await f.messages.add({archiveId:e,role:"assistant",content:p.content,timestamp:Date.now(),summaryStatus:"未操作"}),c=await f.archives.get(e);return c&&await f.archives.update(e,{tokenStats:{missCost:c.tokenStats.missCost+(p.usage.promptTokens-p.usage.cachedTokens),hitCost:c.tokenStats.hitCost+p.usage.cachedTokens,outputCost:c.tokenStats.outputCost+p.usage.completionTokens}}),m}catch(t){const r=t instanceof Error?t.message:"AI 请求失败，请重试";throw s.showToast(r,"error"),t}finally{o.stopGenerating()}}async function a(e,i,o){const s=await f.archives.get(e),t=(s==null?void 0:s.promptSummary)||"请对以下内容进行总结。",r=i.map(l=>`[${l.role==="user"?"用户":"AI"}]: ${l.content}`).join(`

`),m=`【现有记忆】
${`
[当前状态]${o.currentStatus}
[完整剧情进展]${o.plotLine}
[完整角色关系]${o.characterRelations}
[待解决问题]${o.pendingIssues}
[关键信息]${o.keyInfo}`}

【新对话内容】
${r}`,c=y(),h=$();c.startGenerating();try{const l=(s==null?void 0:s.memoryApiId)??c.selectedApiId??void 0,g=await w(e,t,[{role:"user",content:m}],l);return c.stopGenerating(),v(g.content)}catch(l){c.stopGenerating();const g=l instanceof Error?l.message:"总结请求失败";throw h.showToast(g,"error"),l}}async function n(e,i){const o=await fetch(`${e}/v1/models`,{headers:{Authorization:`Bearer ${i}`}});if(!o.ok)throw new Error("获取模型列表失败");return((await o.json()).data||[]).map(t=>t.id)}return{executeAiInference:u,callSummaryLLM:a,fetchModels:n}}function v(u){const a=u.split(/\n(?=\[当前状态\]|\[完整剧情进展\]|\[完整角色关系\]|\[待解决问题\]|\[关键信息\])/),n={currentStatus:"",plotLine:"",characterRelations:"",pendingIssues:"",keyInfo:""};for(const e of a)e.startsWith("[当前状态]")?n.currentStatus=e.replace("[当前状态]","").trim():e.startsWith("[完整剧情进展]")?n.plotLine=e.replace("[完整剧情进展]","").trim():e.startsWith("[完整角色关系]")?n.characterRelations=e.replace("[完整角色关系]","").trim():e.startsWith("[待解决问题]")?n.pendingIssues=e.replace("[待解决问题]","").trim():e.startsWith("[关键信息]")&&(n.keyInfo=e.replace("[关键信息]","").trim());return n}export{y as a,w as c,T as u};
