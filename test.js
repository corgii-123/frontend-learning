var isSymmetric = function(root) {
  const queue1 = [root]
  const queue2 = [root]
  while(queue1.length && queue2.length) {
      let current1 = queue1.shift()
      let current2 = queue2.shift()
      if(current2.val !== current1.val) return false
      current1.left ? queue1.push(current1.left) : null
      current1.right ? queue1.push(current1.right) : null
      current2.right ? queue2.push(current2.right) : null
      current2.left ? queue2.push(current2.left) : null
  }
  return true
};
