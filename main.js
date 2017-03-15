#!/usr/bin/env node
const FAT = require('nos-mkfat')
const fs = require('fs')
const tmp = require('tmp')
const concat = require('concat-stream')
const yaml = require('js-yaml')

let fat = new FAT({name:'cidata'})
let out = tmp.fileSync()

process.stdin.pipe(concat(config=>{
	let configObj = JSON.parse(config)

	let user = Buffer.from("#cloud-config\n" + yaml.safeDump(configObj.user || {}))
	let meta = Buffer.from("#cloud-config\n" + yaml.safeDump(configObj.meta || {}))

	fat.entry({name:'user-data', size:user.length}, user)
	fat.entry({name:'meta-data', size:meta.length}, meta)

	function pipeOut(fd) {
		let bar = fs.createReadStream(null, {fd})
		bar.pipe(process.stdout)
	}

	fat.makeDisk(out.fd).then(()=>pipeOut(out.fd)).catch(console.err)
}))
