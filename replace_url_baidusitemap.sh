#!/bin/sh

tmp="public/baidusitemap0.xml"
bdxml="public/baidusitemap.xml"

if [ -f $tmp ]; then
rm $tmp
print "Deleting tmp file."
fi

if [ ! -f $tmp ]; then
touch $tmp
print "Create tmp file."
fi

cat $bdxml | while read line
do
	echo "${line//xiaoyan94.github.io/xy94.gitee.io}" >> $tmp
done

print "After replacement:"

while read line
do
	print "${line}"
done < $tmp

rm $bdxml
mv $tmp $bdxml

print "End replacement."
