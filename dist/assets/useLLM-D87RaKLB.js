import{d as m}from"./createLucideIcon-BZcX3mE3.js";import{J as k,k as h,l as S}from"./index-Da6b_juE.js";const y=k("session",()=>{const u=h(null),o=h(null),e=h(!1),t=h(0);let s=null;function n(){e.value=!0,t.value=0,s=setInterval(()=>{t.value++},1e3)}function a(){e.value=!1,s&&(clearInterval(s),s=null)}return{currentArchiveId:u,selectedApiId:o,isGenerating:e,generatingSeconds:t,startGenerating:n,stopGenerating:a}});async function $(u){const o=await m.archives.get(u);if(!o)return"";const e=[];o.promptStory&&e.push(o.promptStory);for(const s of o.referencedSystemConfigKeys){const n=await m.systemConfigs.get(s);n&&e.push(`【${n.key}】
${n.value}`)}for(const s of o.privateConfigs)e.push(`【${s.key}】
${s.value}`);o.worldSetting&&e.push(`【初始世界观】
${o.worldSetting}`);for(const s of o.worldConfigs)e.push(`【${s.key}】
${s.value}`);const t=o.memory;return(t.currentStatus||t.plotLine||t.characterRelations||t.pendingIssues||t.keyInfo)&&e.push(`【当前剧情记忆】
[当前状态]${t.currentStatus}
[完整剧情进展]${t.plotLine}
[完整角色关系]${t.characterRelations}
[待解决问题]${t.pendingIssues}
[关键信息]${t.keyInfo}`),e.join(`

`)}async function I(u){return(await m.messages.where({archiveId:u,summaryStatus:"未操作"}).sortBy("timestamp")).map(e=>({role:e.role,content:e.content}))}async function w(u,o,e,t,s){var i,g,c,d;const n=y(),a=s??n.selectedApiId??void 0,r=a!==void 0?await m.apiConfigs.get(a):void 0;if(!r)throw new Error("未选择 API 配置");const f=[{role:"system",content:o},...e,{role:"user",content:t}],p=await fetch(`${r.baseUrl}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r.apiKey}`},body:JSON.stringify({model:r.model,temperature:r.temperature,messages:f})});if(!p.ok)throw new Error(`API 请求失败: ${p.status}`);const l=await p.json();return{content:l.choices[0].message.content,usage:{promptTokens:((i=l.usage)==null?void 0:i.prompt_tokens)??0,cachedTokens:((c=(g=l.usage)==null?void 0:g.prompt_tokens_details)==null?void 0:c.cached_tokens)??0,completionTokens:((d=l.usage)==null?void 0:d.completion_tokens)??0}}}function T(){async function u(t,s){const n=y(),a=S();n.startGenerating();try{const r=await $(t),f=await I(t),p=await w(t,r,f,s),l=await m.messages.add({archiveId:t,role:"assistant",content:p.content,timestamp:Date.now(),summaryStatus:"未操作"}),i=await m.archives.get(t);return i&&await m.archives.update(t,{tokenStats:{missCost:i.tokenStats.missCost+(p.usage.promptTokens-p.usage.cachedTokens),hitCost:i.tokenStats.hitCost+p.usage.cachedTokens,outputCost:i.tokenStats.outputCost+p.usage.completionTokens}}),l}catch(r){const f=r instanceof Error?r.message:"AI 请求失败，请重试";throw a.showToast(f,"error"),r}finally{n.stopGenerating()}}async function o(t,s,n){const a=await m.archives.get(t),r=(a==null?void 0:a.promptSummary)||"请对以下内容进行总结。",f=s.map(c=>`[${c.role==="user"?"用户":"AI"}]: ${c.content}`).join(`

`),l=`【现有记忆】
${`
[当前状态]${n.currentStatus}
[完整剧情进展]${n.plotLine}
[完整角色关系]${n.characterRelations}
[待解决问题]${n.pendingIssues}
[关键信息]${n.keyInfo}`}

【新对话内容】
${f}`,i=y(),g=S();i.startGenerating();try{const c=(a==null?void 0:a.memoryApiId)??i.selectedApiId??void 0,d=await w(t,r,[],l,c);return i.stopGenerating(),v(d.content)}catch(c){i.stopGenerating();const d=c instanceof Error?c.message:"总结请求失败";throw g.showToast(d,"error"),c}}async function e(t,s){const n=await fetch(`${t}/v1/models`,{headers:{Authorization:`Bearer ${s}`}});if(!n.ok)throw new Error("获取模型列表失败");return((await n.json()).data||[]).map(r=>r.id)}return{executeAiInference:u,callSummaryLLM:o,fetchModels:e}}function v(u){const o=u.split(/\n(?=\[当前状态\]|\[完整剧情进展\]|\[完整角色关系\]|\[待解决问题\]|\[关键信息\])/),e={currentStatus:"",plotLine:"",characterRelations:"",pendingIssues:"",keyInfo:""};for(const t of o)t.startsWith("[当前状态]")?e.currentStatus=t.replace("[当前状态]","").trim():t.startsWith("[完整剧情进展]")?e.plotLine=t.replace("[完整剧情进展]","").trim():t.startsWith("[完整角色关系]")?e.characterRelations=t.replace("[完整角色关系]","").trim():t.startsWith("[待解决问题]")?e.pendingIssues=t.replace("[待解决问题]","").trim():t.startsWith("[关键信息]")&&(e.keyInfo=t.replace("[关键信息]","").trim());return e}export{y as a,T as u};
